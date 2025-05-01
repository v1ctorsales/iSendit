import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function getLastImportDate(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const { empresa, localidade } = req.query;

    if (!empresa) {
        return res.status(400).json({ message: 'Empresa é obrigatória' });
    }

    try {
        // 🔍 Monta a query básica
        let query = supabase
            .from('interfaces')
            .select('created_at')
            .eq('empresa', empresa)
            .order('created_at', { ascending: false })
            .limit(1);  // só precisamos da mais recente

        // Filtra por localidade se for fornecida
        if (localidade) {
            query = query.eq('localidade', localidade);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao buscar última data de importação:', error);
            return res.status(500).json({ message: 'Erro ao buscar a última data de importação.' });
        }

        if (!data || data.length === 0) {
            return res.status(200).json({ lastImportDate: null, message: 'Nenhuma interface encontrada.' });
        }

        // Retorna a data mais recente
        return res.status(200).json({ lastImportDate: data[0].created_at });
    } catch (err) {
        console.error('Erro geral:', err);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}
