import { createLogger } from "@btitan/logger";
import { QueueJob } from "@btitan/types";
import { processIndexerCatchup } from "./jobs/indexerCatchup.job";
import { processStatsRecalculation } from "./jobs/statsRecalculation.job";

const logger = createLogger("Queue:Worker");

export class QueueWorker {
  private isRunning: boolean = false;
  private timer: NodeJS.Timeout | null = null;

  async start() {
    this.isRunning = true;
    logger.info("Worker service initiated. Listening for scheduled tasks...");

    // Periodic heartbeat / healthcheck task
    this.timer = setInterval(async () => {
      if (!this.isRunning) return;
      try {
        await this.runHeartbeatCheck();
      } catch (err) {
        logger.error("Error during scheduled background task execution:", err);
      }
    }, 60000);
  }

  async stop() {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    logger.info("Worker service stopped gracefully.");
  }

  async processJob(job: QueueJob): Promise<void> {
    logger.info(`Processing job ${job.name} (ID: ${job.id})`);

    switch (job.name) {
      case "INDEXER_CATCHUP":
        await processIndexerCatchup(job.data);
        break;
      case "STATS_RECALCULATION":
        await processStatsRecalculation(job.data);
        break;
      default:
        logger.warn(`Unrecognized job name: ${(job as any).name}`);
    }
  }

  private async runHeartbeatCheck() {
    logger.debug("Running background worker heartbeat...");
  }
}
