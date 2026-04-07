import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ItemService } from 'src/item/item.service';
import { ItemRepository } from 'src/item/item.repository';
import { DatabaseService } from 'src/database/database.service';

const mockItemRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByTrader: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  addPhoto: jest.fn(),
};

const mockTrader = { trader_id: 10, user_id: 1 };
const mockItem = {
  item_id: 100,
  trader_id: 10,
  item_name: 'Laptop',
  status: 'APPROVED',
  is_available: true,
};

const mockDatabaseService = {
  client: {
    trader: {
      findUnique: jest.fn(),
    },
  },
};

describe('ItemService', () => {
  let service: ItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemService,
        { provide: ItemRepository, useValue: mockItemRepository },
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<ItemService>(ItemService);
    jest.clearAllMocks();
  });

  // ─── createItem ───────────────────────────────────────────────────────────────

  describe('createItem', () => {
    it('creates an item under the trader profile (PENDING status by default)', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockItemRepository.create.mockResolvedValue({ ...mockItem, status: 'PENDING' });

      const dto = { itemName: 'Laptop', description: 'Good condition', categoryId: 1 };
      const result = await service.createItem(1, dto);

      expect(mockDatabaseService.client.trader.findUnique).toHaveBeenCalledWith({
        where: { user_id: 1 },
      });
      expect(mockItemRepository.create).toHaveBeenCalledWith(10, dto);
      expect(result.status).toBe('PENDING');
    });

    it('throws NotFoundException if trader profile not found', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(null);

      await expect(
        service.createItem(99, { itemName: 'X', description: 'Y', categoryId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getAllItems ───────────────────────────────────────────────────────────────

  describe('getAllItems', () => {
    it('returns all items from repository (only APPROVED+available handled by repo)', async () => {
      mockItemRepository.findAll.mockResolvedValue([mockItem]);

      const result = await service.getAllItems();

      expect(mockItemRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  // ─── getItemById ──────────────────────────────────────────────────────────────

  describe('getItemById', () => {
    it('returns item when found', async () => {
      mockItemRepository.findById.mockResolvedValue(mockItem);

      const result = await service.getItemById(100);

      expect(result).toEqual(mockItem);
    });

    it('throws NotFoundException when item does not exist', async () => {
      mockItemRepository.findById.mockResolvedValue(null);

      await expect(service.getItemById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getMyItems ───────────────────────────────────────────────────────────────

  describe('getMyItems', () => {
    it('returns only items belonging to the requesting trader', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockItemRepository.findByTrader.mockResolvedValue([mockItem]);

      const result = await service.getMyItems(1);

      expect(mockItemRepository.findByTrader).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(1);
    });
  });

  // ─── updateItem ───────────────────────────────────────────────────────────────

  describe('updateItem', () => {
    it('updates item when trader is the owner', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockItemRepository.update.mockResolvedValue({ ...mockItem, item_name: 'Updated Laptop' });

      const result = await service.updateItem(1, 100, { itemName: 'Updated Laptop' });

      expect(mockItemRepository.update).toHaveBeenCalledWith(100, { itemName: 'Updated Laptop' });
      expect(result.item_name).toBe('Updated Laptop');
    });

    it('throws NotFoundException when item does not exist', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockItemRepository.findById.mockResolvedValue(null);

      await expect(service.updateItem(1, 999, { itemName: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when trader does not own the item', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockItemRepository.findById.mockResolvedValue({ ...mockItem, trader_id: 99 }); // different owner

      await expect(service.updateItem(1, 100, { itemName: 'X' })).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── deleteItem ───────────────────────────────────────────────────────────────

  describe('deleteItem', () => {
    it('deletes item when trader is the owner', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockItemRepository.delete.mockResolvedValue(mockItem);

      await service.deleteItem(1, 100);

      expect(mockItemRepository.delete).toHaveBeenCalledWith(100);
    });

    it('throws ForbiddenException when trader does not own the item', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockItemRepository.findById.mockResolvedValue({ ...mockItem, trader_id: 99 });

      await expect(service.deleteItem(1, 100)).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── addPhoto ─────────────────────────────────────────────────────────────────

  describe('addPhoto', () => {
    it('adds photo when trader owns the item', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockItemRepository.addPhoto.mockResolvedValue({ photo_id: 1 });

      await service.addPhoto(1, 100, { photoUrl: 'http://img.com/photo.jpg', displayOrder: 1 });

      expect(mockItemRepository.addPhoto).toHaveBeenCalledWith(100, 'http://img.com/photo.jpg', 1);
    });

    it('throws ForbiddenException when trader does not own the item', async () => {
      mockDatabaseService.client.trader.findUnique.mockResolvedValue(mockTrader);
      mockItemRepository.findById.mockResolvedValue({ ...mockItem, trader_id: 99 });

      await expect(
        service.addPhoto(1, 100, { photoUrl: 'http://img.com/photo.jpg', displayOrder: 1 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
