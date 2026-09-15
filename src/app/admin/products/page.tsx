'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { apiClient, type AdminProduct, type AdminProductInput } from '@/lib/api-client';

const emptyProduct: AdminProductInput = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  comparePrice: null,
  category: 'unisex',
  images: [''],
  sizes: [],
  colors: [],
  material: null,
  care: null,
  featured: false,
  inStock: true,
  stockCount: 0,
};

function toList(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState<AdminProductInput>(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void apiClient.getAdminProducts().then((response) => {
      if (cancelled) return;
      if (response.success && response.data) setProducts(response.data);
      else setError(response.error || 'Unable to load products.');
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const resetForm = () => {
    setForm(emptyProduct);
    setEditingId(null);
  };

  const editProduct = (product: AdminProduct) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      comparePrice: product.comparePrice,
      category: product.category,
      images: product.images,
      sizes: product.sizes,
      colors: product.colors,
      material: product.material,
      care: product.care,
      featured: product.featured,
      inStock: product.inStock,
      stockCount: product.stockCount,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    const data = { ...form, images: form.images.filter(Boolean) };
    const response = editingId
      ? await apiClient.updateAdminProduct(editingId, data)
      : await apiClient.createAdminProduct(data);
    if (response.success && response.data) {
      setProducts((current) => editingId
        ? current.map((product) => product.id === editingId ? response.data as AdminProduct : product)
        : [response.data as AdminProduct, ...current]);
      resetForm();
    } else {
      setError(response.error || 'Unable to save product.');
    }
    setIsSaving(false);
  };

  const removeProduct = async (product: AdminProduct) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    const response = await apiClient.deleteAdminProduct(product.id);
    if (response.success) setProducts((current) => current.filter((item) => item.id !== product.id));
    else setError(response.error || 'Unable to delete product.');
  };

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 border-b border-line pb-7">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-brown">Admin / Catalogue</p>
          <h1 className="text-4xl font-light tracking-[-0.04em] text-ink">Products</h1>
          <p className="mt-2 text-sm text-muted">Create and maintain the pieces in your collection.</p>
        </header>

        {error && <div className="mb-6 border border-[#e4c9c0] bg-[#fbefeb] p-4 text-sm text-clay">{error}</div>}

        <form onSubmit={saveProduct} className="mb-10 rounded-md border border-line bg-white p-5 sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-medium text-ink">{editingId ? 'Edit product' : 'Add product'}</h2>
            {editingId && <Button type="button" variant="ghost" size="sm" onClick={resetForm}><X size={15} /> Cancel</Button>}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Product name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Input label="Slug" required value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
            <Input label="Price" required type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} />
            <Input label="Compare-at price" type="number" min="0" step="0.01" value={form.comparePrice ?? ''} onChange={(event) => setForm({ ...form, comparePrice: event.target.value ? Number(event.target.value) : null })} />
            <label className="text-sm text-muted">Category<select className="mt-2 w-full border border-line bg-white px-3.5 py-3 text-sm text-ink" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as AdminProductInput['category'] })}><option value="womens">Womens</option><option value="mens">Mens</option><option value="unisex">Unisex</option><option value="accessories">Accessories</option></select></label>
            <Input label="Stock count" required type="number" min="0" step="1" value={form.stockCount} onChange={(event) => setForm({ ...form, stockCount: Number(event.target.value), inStock: Number(event.target.value) > 0 })} />
            <div className="md:col-span-2"><label className="text-xs font-medium uppercase tracking-[0.1em] text-muted">Description<textarea required minLength={10} className="mt-2 min-h-28 w-full border border-line bg-white px-3.5 py-3 text-sm text-ink outline-none focus:border-olive focus:ring-1 focus:ring-olive" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label></div>
            <Input label="Image URLs" required helperText="Comma-separated HTTPS image URLs." value={form.images.join(', ')} onChange={(event) => setForm({ ...form, images: toList(event.target.value) })} />
            <Input label="Sizes" helperText="Comma-separated values." value={form.sizes.join(', ')} onChange={(event) => setForm({ ...form, sizes: toList(event.target.value) })} />
            <Input label="Colors" value={form.colors.join(', ')} onChange={(event) => setForm({ ...form, colors: toList(event.target.value) })} />
            <Input label="Material" value={form.material ?? ''} onChange={(event) => setForm({ ...form, material: event.target.value || null })} />
            <Input label="Care instructions" value={form.care ?? ''} onChange={(event) => setForm({ ...form, care: event.target.value || null })} />
            <div className="flex items-center gap-6 text-sm text-ink md:col-span-2"><label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Featured</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.inStock} onChange={(event) => setForm({ ...form, inStock: event.target.checked })} /> Available to shoppers</label></div>
          </div>
          <Button type="submit" className="mt-6" isLoading={isSaving}>{editingId ? <Pencil size={16} /> : <Plus size={16} />}{editingId ? 'Save changes' : 'Add product'}</Button>
        </form>

        {isLoading ? <p className="border border-line bg-white p-8 text-sm text-muted">Loading products...</p> : products.length === 0 ? <p className="border border-dashed border-line bg-white p-10 text-center text-sm text-muted">No products found.</p> : (
          <div className="overflow-x-auto rounded-md border border-line bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line bg-[#faf9f6] text-xs uppercase tracking-[0.1em] text-muted"><tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Stock</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
              <tbody>{products.map((product) => <tr key={product.id} className="border-b border-line last:border-0"><td className="px-5 py-4"><p className="font-medium text-ink">{product.name}</p><p className="text-xs text-muted">{product.category} · {product._count.reviews} reviews</p></td><td className="px-5 py-4 text-ink">${product.price.toFixed(2)}</td><td className="px-5 py-4 text-muted">{product.stockCount}</td><td className="px-5 py-4"><span className={product.inStock ? 'text-olive' : 'text-clay'}>{product.inStock ? 'Available' : 'Hidden'}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => editProduct(product)}><Pencil size={14} /> Edit</Button><Button size="sm" variant="danger" onClick={() => void removeProduct(product)}><Trash2 size={14} /></Button></div></td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
