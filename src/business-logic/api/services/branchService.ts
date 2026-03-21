import { supabase } from '../supabase';

export const branchService = {
  async getAll() {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('sort_order');
    if (error) throw error;
    return data ?? [];
  },
};
