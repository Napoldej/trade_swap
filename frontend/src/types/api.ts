// ─── Enums ────────────────────────────────────────────────────────────────────

export type Role = 'TRADER' | 'VERIFIER' | 'ADMIN';
export type ItemStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TradeStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

// ─── User & Auth ──────────────────────────────────────────────────────────────

export interface User {
  user_id: number;
  user_name: string;
  first_name: string | null;
  last_name: string | null;
  role: Role;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user_name: string;
  role: Role;
  user_id: number;
}

export interface RegisterDto {
  user_name: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: 'TRADER' | 'VERIFIER';
}

export interface LoginDto {
  user_name: string;
  password: string;
}

// ─── Trader ───────────────────────────────────────────────────────────────────

export interface Trader {
  trader_id: number;
  user_id: number;
  rating: number;
  total_trades: number;
  user: Pick<User, 'user_name' | 'first_name' | 'last_name' | 'created_at'>;
  items?: TraderItem[];
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  category_id: number;
  category_name: string;
}

// ─── Item ─────────────────────────────────────────────────────────────────────

export interface ItemPhoto {
  photo_id: number;
  item_id: number;
  photo_url: string;
  display_order: number;
  created_at: string;
}

export interface TraderItem {
  item_id: number;
  trader_id: number;
  category_id: number;
  item_name: string;
  description: string;
  is_available: boolean;
  status: ItemStatus;
  verified_by: number | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  photos?: ItemPhoto[];
  trader?: Pick<Trader, 'trader_id' | 'rating' | 'total_trades' | 'user'>;
  user_trade_status?: 'available' | 'user_pending' | 'offered_to_you' | 'in_trade' | 'own_item' | 'own_item_has_proposals' | 'own_item_in_trade';
  incoming_proposals_count?: number;
}

export interface CreateItemDto {
  itemName: string;
  description: string;
  categoryId: number;
}

export interface UpdateItemDto {
  item_name?: string;
  description?: string;
  category_id?: number;
}

// ─── Trade ────────────────────────────────────────────────────────────────────

export interface Trade {
  trade_id: number;
  proposer_id: number;
  proposer_item_id: number;
  receiver_id: number;
  receiver_item_id: number;
  status: TradeStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  proposer?: Pick<Trader, 'trader_id' | 'rating' | 'user'>;
  receiver?: Pick<Trader, 'trader_id' | 'rating' | 'user'>;
  proposer_item?: TraderItem;
  receiver_item?: TraderItem;
}

export interface CreateTradeDto {
  proposerItemId: number;
  receiverId: number;
  receiverItemId: number;
}

// ─── Rating ───────────────────────────────────────────────────────────────────

export interface Rating {
  rating_id: number;
  trade_id: number;
  rater_id: number;
  ratee_id: number;
  score: number;
  comment: string | null;
  created_at: string;
  rater?: Pick<Trader, 'trader_id' | 'user'>;
}

export interface CreateRatingDto {
  tradeId: number;
  rateeId: number;
  score: number;
  comment?: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface Message {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  sender?: Pick<Trader, 'trader_id' | 'user'>;
}

export interface SendMessageDto {
  content: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  notification_id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminAnalytics {
  total_users: number;
  total_traders: number;
  total_verifiers: number;
  total_items: number;
  total_trades: number;
  trades_by_status: Record<TradeStatus, number>;
}

// ─── Verifier ─────────────────────────────────────────────────────────────────

export interface VerifyItemDto {
  verified_by: number;
}

export interface RejectItemDto {
  rejection_reason: string;
}

// ─── API Errors ───────────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
