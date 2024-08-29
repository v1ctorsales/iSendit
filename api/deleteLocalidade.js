import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function deleteLocalidade(req, res) {
    if (req.method === 'POST') {
        const { nome, empresa } = req.body;

        if (!nome || !empresa) {
            return res.status(400).json({ message: 'Dados incompletos' });
        }

        try {
            const { data, error } = await supabase
                .from('localidades')
                .delete()
                .match({ nome: nome, empresa: empresa });

            if (error) {
                console.error('Erro ao excluir localidade:', error);
                return res.status(500).json({ message: 'Erro ao excluir localidade' });
            }

            return res.status(200).json({ success: true, message: 'Localidade excluída com sucesso' });
        } catch (err) {
            console.error('Erro ao conectar com Supabase:', err);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    } else {
        return res.status(405).json({ message: 'Método não permitido' });
    }
}
