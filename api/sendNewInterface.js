import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function sendNewInterface(req, res) {
    if (req.method === 'POST') {
        const { nome, localidade, empresa } = req.body;

        if (!nome || !localidade || !empresa) {
            return res.status(400).json({ message: 'Dados incompletos' });
        }

        try {
            const { data: existingInterface, error: checkError } = await supabase
                .from('interfaces')
                .select('nome')
                .eq('nome', nome)
                .eq('localidade', localidade)
                .eq('empresa', empresa)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                console.error('Erro ao buscar interface:', checkError);
                return res.status(500).json({ message: 'Erro ao verificar interface' });
            }

            if (existingInterface) {
                return res.status(409).json({ message: 'Já existe uma interface com este nome para a mesma localidade e empresa' });
            }

            const { data, error } = await supabase
                .from('interfaces')
                .insert([{ nome, localidade, empresa }]);

            if (error) {
                console.error('Erro ao inserir interface:', error);
                return res.status(500).json({ message: 'Erro ao inserir interface' });
            }

            return res.status(200).json({ success: true, message: 'Interface adicionada com sucesso' });
        } catch (err) {
            console.error('Erro ao conectar com Supabase:', err);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
