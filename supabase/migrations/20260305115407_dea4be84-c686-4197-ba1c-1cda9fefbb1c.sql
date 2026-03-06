
-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'preparing', 'on_way', 'delivered', 'returned');

-- Create products table
CREATE TABLE public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  image TEXT NOT NULL DEFAULT '📦',
  video BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  sales INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agents table
CREATE TABLE public.agents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  zone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  customer TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  total NUMERIC NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  agent_id INTEGER REFERENCES public.agents(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create returns table
CREATE TABLE public.returns (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id),
  product_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_movements table
CREATE TABLE public.inventory_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES public.products(id),
  qty_change INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Public read access for products (store front)
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products are publicly updatable" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Products are publicly insertable" ON public.products FOR INSERT WITH CHECK (true);

-- Public access for agents (no auth yet)
CREATE POLICY "Agents are publicly readable" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Agents are publicly insertable" ON public.agents FOR INSERT WITH CHECK (true);

-- Public access for orders (no auth yet)
CREATE POLICY "Orders are publicly readable" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Orders are publicly insertable" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders are publicly updatable" ON public.orders FOR UPDATE USING (true);

-- Public access for order_items
CREATE POLICY "Order items are publicly readable" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Order items are publicly insertable" ON public.order_items FOR INSERT WITH CHECK (true);

-- Public access for returns
CREATE POLICY "Returns are publicly readable" ON public.returns FOR SELECT USING (true);
CREATE POLICY "Returns are publicly insertable" ON public.returns FOR INSERT WITH CHECK (true);

-- Public access for inventory_movements
CREATE POLICY "Inventory movements are publicly readable" ON public.inventory_movements FOR SELECT USING (true);
CREATE POLICY "Inventory movements are publicly insertable" ON public.inventory_movements FOR INSERT WITH CHECK (true);

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create order ID sequence function
CREATE OR REPLACE FUNCTION public.generate_order_id()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 5) AS INTEGER)), 0) + 1 INTO next_num FROM public.orders;
  RETURN 'UAE-' || LPAD(next_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql SET search_path = public;
