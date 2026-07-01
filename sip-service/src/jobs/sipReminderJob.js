const pool = require("../config/db");

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:3005";

// ✅ Server-to-server notification call. Wrapped so a notification-service
// outage never crashes the cron job itself.
const notifyUser = async (userId, title, message, type) => {
  try {
    await fetch(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: Number(userId), title, message, type }),
    });
  } catch (e) {
    console.error("⚠️ Failed to send SIP reminder (non-blocking):", e.message);
  }
};

// ✅ Track which SIP+date reminders have already been sent, so the daily
// job (which may run more than once if the pod restarts) never sends the
// same reminder twice for the same due date.
const ensureReminderTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sip_reminders_sent (
        id SERIAL PRIMARY KEY,
        sip_id INTEGER NOT NULL,
        reminder_date DATE NOT NULL,
        sent_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(sip_id, reminder_date)
      );
    `);
  } catch (e) {
    console.error("Could not ensure sip_reminders_sent table:", e.message);
  }
};

// Computes the next upcoming SIP date for a given start_date + frequency,
// based on today. SIPs repeat monthly/quarterly/yearly from their original
// start_date day-of-month.
const getNextDueDate = (startDate, frequency) => {
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthsToAdd = frequency === "QUARTERLY" ? 3 : frequency === "YEARLY" ? 12 : 1;
  let next = new Date(start);

  // Advance `next` forward in steps until it's today or later
  while (next < today) {
    next.setMonth(next.getMonth() + monthsToAdd);
  }
  return next;
};

// ✅ Main job — scans all ACTIVE sips, finds ones due in the next 2 days,
// and fires a one-time reminder per due date (deduplicated via the table above).
const runSipReminderCheck = async () => {
  await ensureReminderTable();
  try {
    const { rows: sips } = await pool.query(`SELECT * FROM sips WHERE status = 'ACTIVE'`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const sip of sips) {
      const nextDue = getNextDueDate(sip.start_date, sip.frequency);
      const daysUntilDue = Math.round((nextDue - today) / (1000 * 60 * 60 * 24));

      // Remind when due in exactly 2 days or 1 day (two gentle nudges)
      if (daysUntilDue === 2 || daysUntilDue === 1) {
        const dueDateStr = nextDue.toISOString().split("T")[0];
        try {
          // Atomic insert — if this (sip_id, reminder_date) pair already
          // exists, the INSERT silently does nothing (ON CONFLICT DO NOTHING),
          // so we never send the same reminder twice.
          const insertResult = await pool.query(
            `INSERT INTO sip_reminders_sent (sip_id, reminder_date)
             VALUES ($1, $2)
             ON CONFLICT (sip_id, reminder_date) DO NOTHING
             RETURNING id`,
            [sip.id, dueDateStr]
          );

          // Only notify if this insert actually happened (i.e. wasn't a duplicate)
          if (insertResult.rows.length > 0) {
            await notifyUser(
              sip.user_id,
              "Upcoming SIP Reminder 📅",
              `Your SIP of ₹${sip.amount} for ${sip.fund_name} is due in ${daysUntilDue} day${daysUntilDue > 1 ? "s" : ""} (${dueDateStr}).`,
              "SIP"
            );
            console.log(`✅ SIP reminder sent: sip_id=${sip.id} user_id=${sip.user_id} due=${dueDateStr}`);
          }
        } catch (e) {
          console.error(`⚠️ Failed reminder for sip_id=${sip.id}:`, e.message);
        }
      }
    }
  } catch (e) {
    console.error("❌ SIP reminder check failed:", e.message);
  }
};

// ✅ Starts the daily check — runs once immediately on service startup
// (covers the case where the pod was down at the scheduled time), then
// every 24 hours after that.
const startSipReminderScheduler = () => {
  runSipReminderCheck(); // run once on boot
  setInterval(runSipReminderCheck, 24 * 60 * 60 * 1000); // then every 24h
  console.log("✅ SIP reminder scheduler started (runs every 24h)");
};

module.exports = { startSipReminderScheduler, runSipReminderCheck };