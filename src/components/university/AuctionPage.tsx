
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Clock, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import CreateAuctionModal from './CreateAuctionModal';
import AuctionCard from './AuctionCard';
import AuctionDetailModal from './AuctionDetailModal';

interface Auction {
  id: string;
  title: string;
  description: string;
  starting_price: number;
  current_price: number;
  reserve_price: number;
  image_urls: string[];
  end_time: string;
  is_active: boolean;
  winner_id: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
  bid_count?: number;
}

export default function AuctionPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const { data: auctionsData, error: auctionsError } = await supabase
        .from('auctions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (auctionsError) throw auctionsError;

      if (auctionsData && auctionsData.length > 0) {
        const userIds = [...new Set(auctionsData.map(auction => auction.user_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, username, avatar_url')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        const profilesMap = new Map();
        profilesData?.forEach(profile => {
          profilesMap.set(profile.user_id, profile);
        });

        // Get bid counts for each auction
        const auctionIds = auctionsData.map(auction => auction.id);
        const { data: bidCounts, error: bidError } = await supabase
          .from('auction_bids')
          .select('auction_id')
          .in('auction_id', auctionIds);

        if (bidError) throw bidError;

        const bidCountMap = new Map();
        bidCounts?.forEach(bid => {
          const count = bidCountMap.get(bid.auction_id) || 0;
          bidCountMap.set(bid.auction_id, count + 1);
        });

        const auctionsWithData = auctionsData.map(auction => ({
          ...auction,
          profiles: profilesMap.get(auction.user_id),
          bid_count: bidCountMap.get(auction.id) || 0
        }));

        setAuctions(auctionsWithData);
      }
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading auctions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="post-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Live Auctions</h2>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Auction
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-surface rounded-xl">
            <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{auctions.length}</p>
            <p className="text-sm text-muted-foreground">Active Auctions</p>
          </div>
          <div className="text-center p-4 bg-surface rounded-xl">
            <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">
              {auctions.reduce((sum, auction) => sum + (auction.bid_count || 0), 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Bids</p>
          </div>
          <div className="text-center p-4 bg-surface rounded-xl">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">
              ${auctions.reduce((sum, auction) => sum + auction.current_price, 0).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">Total Value</p>
          </div>
        </div>
      </div>

      {/* Auctions Grid */}
      {auctions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              onClick={() => setSelectedAuction(auction)}
            />
          ))}
        </div>
      ) : (
        <div className="post-card text-center py-12">
          <p className="text-muted-foreground">No active auctions yet.</p>
          <Button onClick={() => setShowCreateModal(true)} className="mt-4">
            Create the first auction!
          </Button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateAuctionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchAuctions();
          }}
        />
      )}

      {selectedAuction && (
        <AuctionDetailModal
          auction={selectedAuction}
          onClose={() => setSelectedAuction(null)}
          onBidPlaced={fetchAuctions}
        />
      )}
    </div>
  );
}
