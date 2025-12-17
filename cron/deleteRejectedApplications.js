const cron = require("node-cron");
const Application = require("../models/Application");

function startRejectedCleanupCron() {
  cron.schedule("0 0 * * *", async () => {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const result = await Application.deleteMany({
        status: "Rejected",
        rejectedAt: { $lte: oneMonthAgo },
      });

      if (result.deletedCount > 0) {
        console.log(
          ` Deleted ${result.deletedCount} rejected applications`
        );
      }
    } catch (err) {
      console.error(" Rejected cleanup failed:", err.message);
    }
  });
}

module.exports = startRejectedCleanupCron;
