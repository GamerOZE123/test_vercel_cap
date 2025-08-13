
-- Create table for marketplace categories
CREATE TABLE public.marketplace_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for marketplace items (for buy/sell)
CREATE TABLE public.marketplace_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES public.marketplace_categories(id),
  image_urls TEXT[],
  condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  is_sold BOOLEAN DEFAULT FALSE,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for auctions
CREATE TABLE public.auctions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  starting_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  reserve_price DECIMAL(10,2),
  image_urls TEXT[],
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  winner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for auction bids
CREATE TABLE public.auction_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for clubs
CREATE TABLE public.clubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  member_count INTEGER DEFAULT 0,
  admin_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for club memberships
CREATE TABLE public.club_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(club_id, user_id)
);

-- Create table for holiday events
CREATE TABLE public.holiday_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  location TEXT,
  image_url TEXT,
  organizer_id UUID NOT NULL,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for holiday event attendees
CREATE TABLE public.holiday_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.holiday_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create table for item favorites
CREATE TABLE public.item_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('marketplace', 'auction')),
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

-- Enable RLS on all tables
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holiday_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holiday_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for marketplace_categories
CREATE POLICY "Categories are viewable by everyone" ON public.marketplace_categories
FOR SELECT USING (true);

-- RLS policies for marketplace_items
CREATE POLICY "Marketplace items are viewable by everyone" ON public.marketplace_items
FOR SELECT USING (true);

CREATE POLICY "Users can create their own marketplace items" ON public.marketplace_items
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketplace items" ON public.marketplace_items
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketplace items" ON public.marketplace_items
FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for auctions
CREATE POLICY "Auctions are viewable by everyone" ON public.auctions
FOR SELECT USING (true);

CREATE POLICY "Users can create their own auctions" ON public.auctions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own auctions" ON public.auctions
FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for auction_bids
CREATE POLICY "Auction bids are viewable by everyone" ON public.auction_bids
FOR SELECT USING (true);

CREATE POLICY "Users can create their own bids" ON public.auction_bids
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for clubs
CREATE POLICY "Clubs are viewable by everyone" ON public.clubs
FOR SELECT USING (true);

CREATE POLICY "Users can create clubs" ON public.clubs
FOR INSERT WITH CHECK (auth.uid() = admin_user_id);

CREATE POLICY "Club admins can update their clubs" ON public.clubs
FOR UPDATE USING (auth.uid() = admin_user_id);

-- RLS policies for club_memberships
CREATE POLICY "Club memberships are viewable by everyone" ON public.club_memberships
FOR SELECT USING (true);

CREATE POLICY "Users can join clubs" ON public.club_memberships
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave clubs" ON public.club_memberships
FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for holiday_events
CREATE POLICY "Holiday events are viewable by everyone" ON public.holiday_events
FOR SELECT USING (true);

CREATE POLICY "Users can create holiday events" ON public.holiday_events
FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Event organizers can update their events" ON public.holiday_events
FOR UPDATE USING (auth.uid() = organizer_id);

-- RLS policies for holiday_attendees
CREATE POLICY "Holiday attendees are viewable by everyone" ON public.holiday_attendees
FOR SELECT USING (true);

CREATE POLICY "Users can register for events" ON public.holiday_attendees
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unregister from events" ON public.holiday_attendees
FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for item_favorites
CREATE POLICY "Users can view their own favorites" ON public.item_favorites
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites" ON public.item_favorites
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites" ON public.item_favorites
FOR DELETE USING (auth.uid() = user_id);

-- Insert default marketplace categories
INSERT INTO public.marketplace_categories (name, description, icon) VALUES
('Electronics', 'Phones, laptops, gadgets', 'Smartphone'),
('Books', 'Textbooks, novels, study materials', 'Book'),
('Clothing', 'Apparel and accessories', 'Shirt'),
('Furniture', 'Dorm and apartment furniture', 'Home'),
('Sports', 'Sports equipment and gear', 'Trophy'),
('Other', 'Miscellaneous items', 'Package');

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_marketplace_items_updated_at 
    BEFORE UPDATE ON public.marketplace_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update auction current price when new bid is placed
CREATE OR REPLACE FUNCTION update_auction_price()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.auctions 
    SET current_price = NEW.amount 
    WHERE id = NEW.auction_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_auction_price_on_bid
    AFTER INSERT ON public.auction_bids
    FOR EACH ROW EXECUTE FUNCTION update_auction_price();
