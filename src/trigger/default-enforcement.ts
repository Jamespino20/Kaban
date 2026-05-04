import { schedules } from "@trigger.dev/sdk/v3";
import { runAutomatedDefaultEnforcement } from "@/lib/default-enforcement";

export const defaultEnforcementTask = schedules.task({
  id: "automated-default-enforcement",
  // Run daily at midnight UTC
  cron: "0 0 * * *",
  maxDuration: 3600, // 1 hour max run length to prevent hanging DB connections
  run: async (payload, { ctx }) => {
    console.log(
      `Starting automated default enforcement. Run ID: ${ctx.run.id}`,
    );

    try {
      // Execute the shared policy enforcement engine
      const result = await runAutomatedDefaultEnforcement({});

      console.log(
        `Default enforcement completed. Enforced loans: ${result.enforcedLoans}`,
      );

      return {
        success: true,
        enforcedLoansCount: result.enforcedLoans,
        environment: ctx.environment.type,
      };
    } catch (error) {
      console.error(
        "Critical failure during default enforcement execution:",
        error,
      );
      // Throwing error allows Trigger.dev to manage retries and flag alerts
      throw error;
    }
  },
});
