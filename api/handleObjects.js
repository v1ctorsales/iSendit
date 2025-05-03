import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handleObjects(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const { empresa, localidade } = req.query;

    if (!empresa) {
        console.error('UUID da empresa não especificado');
        return res.status(400).json({ message: 'UUID da empresa não especificado' });
    }

    if (!localidade) {
        console.error('Localidade não especificada');
        return res.status(400).json({ message: 'Localidade não especificada' });
    }

    try {
        console.log(`🔎 Buscando objetos para localidade: ${localidade} e empresa: ${empresa}`);

        const { data: objetosData, error } = await supabase
            .from('objetos')
            .select('nome, info')
            .eq('empresa', empresa)
            .eq('localidade', localidade);

        if (error) {
            console.error('Erro ao buscar objetos:', error);
            return res.status(500).json({ message: 'Erro ao buscar objetos.' });
        }

        return res.status(200).json(objetosData);
    } catch (err) {
        console.error('Erro ao conectar com Supabase:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
}
