import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeftRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tradesService } from "@/services/trades.service";
import { chatService } from "@/services/chat.service";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";

const Chat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: trades = [] } = useQuery({
    queryKey: ["my-trades"],
    queryFn: tradesService.getMyTrades,
  });

  // Conversations = trades that are ACCEPTED or COMPLETED (have an active chat)
  const conversations = trades.filter((t) => t.status === "ACCEPTED" || t.status === "COMPLETED" || t.status === "PENDING");

  const activeTradeId = searchParams.get("trade") ? Number(searchParams.get("trade")) : conversations[0]?.trade_id;
  const activeTrade = trades.find((t) => t.trade_id === activeTradeId);

  const { data: messages = [], isLoading: msgsLoading } = useQuery({
    queryKey: ["messages", activeTradeId],
    queryFn: () => chatService.getMessages(activeTradeId!),
    enabled: Boolean(activeTradeId),
    refetchInterval: 5000, // poll every 5s for new messages
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => chatService.sendMessage(activeTradeId!, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeTradeId] });
      setText("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMutation.mutate(text.trim());
  };

  const getOtherUser = (trade: typeof trades[number]) => {
    const iAmProposer = trade.proposer?.user?.user_name === user?.user_name;
    return iAmProposer ? trade.receiver?.user : trade.proposer?.user;
  };

  const otherUser = activeTrade ? getOtherUser(activeTrade) : null;
  const otherName = otherUser ? (otherUser.user_name) : "Unknown";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        {/* Conversation List */}
        <aside className="w-80 border-r flex flex-col shrink-0">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Messages</h2>
          </div>
          <div className="flex-1 overflow-auto">
            {conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center p-6">No active trades yet.</p>
            ) : (
              conversations.map((t) => {
                const other = getOtherUser(t);
                const name = other?.user_name ?? "Unknown";
                const myItem = t.proposer?.user?.user_name === user?.user_name ? t.proposer_item : t.receiver_item;
                const theirItem = t.proposer?.user?.user_name === user?.user_name ? t.receiver_item : t.proposer_item;
                return (
                  <button
                    key={t.trade_id}
                    onClick={() => setSearchParams({ trade: String(t.trade_id) })}
                    className={cn("w-full flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors border-b", activeTradeId === t.trade_id && "bg-muted/50")}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm">{name}</span>
                      <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5 mt-1 w-fit">
                        <ArrowLeftRight className="h-2.5 w-2.5 mr-0.5" />
                        {myItem?.item_name ?? "?"} ↔ {theirItem?.item_name ?? "?"}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat Area */}
        {activeTradeId ? (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{otherName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-sm">{otherName}</p>
                <a href={`/trade/${activeTradeId}`} className="text-xs text-primary hover:underline">View trade →</a>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-3">
              {msgsLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">No messages yet. Say hi!</p>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender?.user?.user_name === user?.user_name;
                  return (
                    <div key={msg.message_id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-xs rounded-2xl px-4 py-2.5", isMe ? "gradient-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md")}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={cn("text-[10px] mt-1", isMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
                          {format(new Date(msg.created_at), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="p-4 border-t flex gap-2" onSubmit={handleSend}>
              <Input placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} className="flex-1" />
              <Button type="submit" className="gradient-primary text-primary-foreground border-0 hover:opacity-90" size="icon" disabled={sendMutation.isPending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
