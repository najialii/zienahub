'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Plus, Edit2, Trash2, Users, RefreshCw } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface PricingTier {
  id: number;
  name: string;
  monthly_fee: number;
  description: string | null;
  is_active: boolean;
  tenants_count: number;
  created_at: string;
}

export default function PricingTiersPage() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    monthly_fee: '',
    description: '',
    is_active: true,
  });

  const headers = () => {
    const token = localStorage.getItem('auth_token');
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const fetchTiers = async () => {
    try {
      const res = await fetch(`${API}/super-admin/pricing-tiers`, { headers: headers() });
      if (!res.ok) {
        throw new Error('Failed to fetch pricing tiers');
      }
      const data = await res.json();
      setTiers(data.data || []);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      setTiers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTiers(); }, []);

  const openModal = (tier?: PricingTier) => {
    if (tier) {
      setEditingTier(tier);
      setFormData({
        name: tier.name,
        monthly_fee: Number(tier.monthly_fee || 0).toString(),
        description: tier.description || '',
        is_active: tier.is_active,
      });
    } else {
      setEditingTier(null);
      setFormData({ name: '', monthly_fee: '', description: '', is_active: true });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTier(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingTier
      ? `${API}/super-admin/pricing-tiers/${editingTier.id}`
      : `${API}/super-admin/pricing-tiers`;
    const method = editingTier ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: headers(),
      body: JSON.stringify(formData),
    });

    closeModal();
    fetchTiers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this pricing tier?')) return;
    
    const res = await fetch(`${API}/super-admin/pricing-tiers/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    
    const data = await res.json();
    if (!data.success) {
      alert(data.message);
      return;
    }
    
    fetchTiers();
  };

  if (loading) return (
    <div className="p-8 flex items-center gap-2 text-neutral-500">
      <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Pricing Tiers</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage monthly fee tiers for vendors</p>
        </div>
        <button onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800">
          <Plus className="w-4 h-4" /> Add Tier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <div key={tier.id} className={`bg-white border-2 rounded-xl p-6 space-y-4 transition-all hover:shadow-lg ${
            tier.is_active ? 'border-neutral-200' : 'border-neutral-100 opacity-60'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-neutral-900">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold text-neutral-900">${Number(tier.monthly_fee || 0).toFixed(0)}</span>
                  <span className="text-sm text-neutral-500">/month</span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                tier.is_active 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-neutral-100 text-neutral-500'
              }`}>
                {tier.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {tier.description && (
              <p className="text-sm text-neutral-600 min-h-[40px]">{tier.description}</p>
            )}

            <div className="flex items-center gap-2 text-sm pt-3 border-t border-neutral-100">
              <div className="flex items-center gap-1.5 text-neutral-600">
                <Users className="w-4 h-4" />
                <span className="font-medium">{tier.tenants_count}</span>
              </div>
              <span className="text-neutral-400">
                vendor{tier.tenants_count !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => openModal(tier)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 text-sm font-medium transition-colors">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => handleDelete(tier.id)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-neutral-900">
              {editingTier ? 'Edit Pricing Tier' : 'Add Pricing Tier'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Monthly Fee ($)</label>
                <input type="number" step="0.01" min="0" required value={formData.monthly_fee}
                  onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900" />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300" />
                <label htmlFor="is_active" className="text-sm text-neutral-700">Active</label>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800">
                  {editingTier ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
