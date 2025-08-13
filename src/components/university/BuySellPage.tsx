
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Heart, Info, Filter, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import CreateMarketplaceItemModal from './CreateMarketplaceItemModal';
import MarketplaceItemCard from './MarketplaceItemCard';
import ItemDetailModal from './ItemDetailModal';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image_urls: string[];
  condition: string;
  location: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

export default function BuySellPage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchItems();
    fetchFavorites();
  }, []);

  const fetchItems = async () => {
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('is_sold', false)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      if (itemsData && itemsData.length > 0) {
        const userIds = [...new Set(itemsData.map(item => item.user_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, username, avatar_url')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        const profilesMap = new Map();
        profilesData?.forEach(profile => {
          profilesMap.set(profile.user_id, profile);
        });

        const itemsWithProfiles = itemsData.map(item => ({
          ...item,
          profiles: profilesMap.get(item.user_id)
        }));

        setItems(itemsWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('item_favorites')
        .select('item_id')
        .eq('user_id', user.id)
        .eq('item_type', 'marketplace');

      if (error) throw error;

      setFavorites(new Set(data?.map(fav => fav.item_id) || []));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (itemId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (favorites.has(itemId)) {
        await supabase
          .from('item_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId)
          .eq('item_type', 'marketplace');
        
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(itemId);
          return newFavorites;
        });
      } else {
        await supabase
          .from('item_favorites')
          .insert({
            user_id: user.id,
            item_id: itemId,
            item_type: 'marketplace'
          });
        
        setFavorites(prev => new Set([...prev, itemId]));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const nextItem = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousItem = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading marketplace items...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="post-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Buy & Sell</h2>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            List Item
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Swipe Cards View */}
      {items.length > 0 ? (
        <div className="relative h-[600px] flex items-center justify-center">
          <div className="relative w-full max-w-sm">
            {items.slice(currentIndex, currentIndex + 3).map((item, index) => (
              <div
                key={item.id}
                className={`absolute inset-0 transition-all duration-300 ${
                  index === 0 ? 'z-30' : index === 1 ? 'z-20 scale-95 opacity-50' : 'z-10 scale-90 opacity-25'
                }`}
                style={{
                  transform: `translateY(${index * 10}px) scale(${1 - index * 0.05})`
                }}
              >
                <MarketplaceItemCard
                  item={item}
                  isFavorited={favorites.has(item.id)}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                  onShowDetails={() => setSelectedItem(item)}
                  onNext={nextItem}
                  onPrevious={previousItem}
                  canGoNext={currentIndex < items.length - 1}
                  canGoPrevious={currentIndex > 0}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="post-card text-center py-12">
          <p className="text-muted-foreground">No items available yet.</p>
          <Button onClick={() => setShowCreateModal(true)} className="mt-4">
            Be the first to list an item!
          </Button>
        </div>
      )}

      {/* Navigation */}
      {items.length > 0 && (
        <div className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={previousItem} 
            disabled={currentIndex === 0}
          >
            Previous
          </Button>
          <span className="flex items-center text-muted-foreground">
            {currentIndex + 1} of {items.length}
          </span>
          <Button 
            variant="outline" 
            onClick={nextItem} 
            disabled={currentIndex >= items.length - 1}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateMarketplaceItemModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchItems();
          }}
        />
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
