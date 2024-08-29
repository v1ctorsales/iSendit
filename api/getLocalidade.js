import { createClient } from '@supabase/supabase-js';

// Substitua pelos valores da sua configuração Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function getLocalidade(req, res) {
    if (req.method === 'GET') {
        const empresa = "empresa_teste";

        const { data, error } = await supabase
            .from('localidades')
            .select('nome')
            .eq('empresa', empresa);

        if (error) {
            console.error('Erro ao buscar dados:', error);
            res.status(500).json({ message: 'Erro ao buscar dados' });
        } else {
            res.status(200).json(data);
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
