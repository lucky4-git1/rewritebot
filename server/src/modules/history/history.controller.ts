import { FastifyReply, FastifyRequest } from 'fastify';
import { HistoryService } from './history.service';
import { successResponse, paginatedResponse } from '../../utils/response';

export class HistoryController {
  private historyService: HistoryService;

  constructor() {
    this.historyService = new HistoryService();
  }

  /**
   * List history events
   * GET /api/v1/history
   */
  async listHistory(
    request: FastifyRequest<{ Querystring: Record<string, string> }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.id;
    const { events, total } = await this.historyService.getUserHistory(
      userId,
      request.query
    );

    const page = parseInt(request.query.page || '1');
    const pageSize = parseInt(request.query.pageSize || '20');

    paginatedResponse(reply, events, total, page, pageSize);
  }

  /**
   * Get a specific history event
   * GET /api/v1/history/:id
   */
  async getHistoryEvent(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.id;
    const eventId = request.params.id;

    const event = await this.historyService.getHistoryEvent(eventId, userId);

    successResponse(reply, event);
  }

  /**
   * Delete a history event
   * DELETE /api/v1/history/:id
   */
  async deleteHistoryEvent(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.id;
    const eventId = request.params.id;

    await this.historyService.deleteHistoryEvent(eventId, userId);

    successResponse(reply, { message: 'History event deleted successfully' });
  }

  /**
   * Clear all history
   * DELETE /api/v1/history
   */
  async clearHistory(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.id;

    await this.historyService.clearHistory(userId);

    successResponse(reply, { message: 'History cleared successfully' });
  }

  /**
   * Get history statistics
   * GET /api/v1/history/stats
   */
  async getStats(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.id;

    const stats = await this.historyService.getHistoryStats(userId);

    successResponse(reply, stats);
  }

  /**
   * Get recent history
   * GET /api/v1/history/recent
   */
  async getRecent(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.id;

    const events = await this.historyService.getRecentHistory(userId);

    successResponse(reply, events);
  }
}
