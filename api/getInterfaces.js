import { createClient } from '@supabase/supabase-js';

// Substitua pelos valores da sua configuração Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function getInterfaces(req, res) {
    if (req.method === 'GET') {
        const { localidade } = req.query;

        if (!localidade) {
            console.error('Localidade não especificada');
            return res.status(400).json({ message: 'Localidade não especificada' });
        }

        try {
            const { data, error } = await supabase
                .from('interfaces')
                .select('nome')
                .eq('localidade', localidade);

            if (error) {
                console.error('Erro ao buscar interfaces:', error);
                return res.status(500).json({ message: 'Erro ao buscar interfaces' });
            }

            return res.status(200).json(data);
        } catch (err) {
            console.error('Erro ao conectar com Supabase:', err);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
