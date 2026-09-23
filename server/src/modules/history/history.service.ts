import { HistoryEvent } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { parseQueryPagination } from '../../utils/validation';

export class HistoryService {
  /**
   * Get history events for a user
   */
  async getUserHistory(
    userId: string,
    query: Record<string, unknown>
  ): Promise<{ events: HistoryEvent[]; total: number }> {
    const { page, pageSize, skip } = parseQueryPagination(query);
    const operation = query.operation as string | undefined;

    const where: any = { userId };

    if (operation) {
      where.operation = operation;
    }

    const [events, total] = await Promise.all([
      prisma.historyEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.historyEvent.count({ where }),
    ]);

    return { events, total };
  }

  /**
   * Get a specific history event
   */
  async getHistoryEvent(eventId: string, userId: string): Promise<HistoryEvent> {
    const event = await prisma.historyEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundError('History event');
    }

    if (event.userId !== userId) {
      throw new ForbiddenError('You do not have access to this history event');
    }

    return event;
  }

  /**
   * Delete a history event
   */
  async deleteHistoryEvent(eventId: string, userId: string): Promise<void> {
    // Check ownership
    await this.getHistoryEvent(eventId, userId);

    await prisma.historyEvent.delete({
      where: { id: eventId },
    });
  }

  /**
   * Delete all history for a user
   */
  async clearHistory(userId: string): Promise<void> {
    await prisma.historyEvent.deleteMany({
      where: { userId },
    });
  }

  /**
   * Get history statistics for a user
   */
  async getHistoryStats(userId: string): Promise<{
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    byOperation: Record<string, number>;
    byProvider: Record<string, number>;
  }> {
    const events = await prisma.historyEvent.findMany({
      where: { userId },
      select: {
        success: true,
        operation: true,
        providerId: true,
      },
    });

    const stats = {
      totalEvents: events.length,
      successfulEvents: events.filter(e => e.success).length,
      failedEvents: events.filter(e => !e.success).length,
      byOperation: {} as Record<string, number>,
      byProvider: {} as Record<string, number>,
    };

    // Count by operation
    events.forEach(event => {
      stats.byOperation[event.operation] = (stats.byOperation[event.operation] || 0) + 1;
      stats.byProvider[event.providerId] = (stats.byProvider[event.providerId] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get recent history (last 20 events)
   */
  async getRecentHistory(userId: string): Promise<HistoryEvent[]> {
    return prisma.historyEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
