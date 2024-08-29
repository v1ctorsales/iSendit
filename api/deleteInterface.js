import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function deleteInterface(req, res) {
    if (req.method === 'POST') {
        const { nome, localidade } = req.body;

        if (!nome || !localidade) {
            return res.status(400).json({ message: 'Dados incompletos' });
        }

        try {
            // Proceder com a exclusão da interface
            const { data, error } = await supabase
                .from('interfaces')
                .delete()
                .match({ nome: nome, localidade: localidade });

            if (error) {
                console.error('Erro ao excluir interface:', error);
                return res.status(500).json({ message: 'Erro ao excluir interface' });
            }

            return res.status(200).json({ success: true, message: 'Interface excluída com sucesso' });
        } catch (err) {
            console.error('Erro ao conectar com Supabase:', err);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    } else {
        return res.status(405).json({ message: 'Método não permitido' });
    }
}
