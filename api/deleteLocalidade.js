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
            // Deleta todas as interfaces associadas à localidade
            const { data: deletedInterfaces, error: deleteInterfacesError } = await supabase
                .from('interfaces')
                .delete()
                .match({ localidade: nome });

            if (deleteInterfacesError) {
                console.error('Erro ao excluir interfaces:', deleteInterfacesError);
                return res.status(500).json({ message: 'Erro ao excluir interfaces associadas' });
            }

            // Deleta a localidade
            const { data: deletedLocalidade, error: deleteLocalidadeError } = await supabase
                .from('localidades')
                .delete()
                .match({ nome: nome, empresa: empresa });

            if (deleteLocalidadeError) {
                console.error('Erro ao excluir localidade:', deleteLocalidadeError);
                return res.status(500).json({ message: 'Erro ao excluir localidade' });
            }

            return res.status(200).json({ success: true, message: 'Localidade e interfaces associadas excluídas com sucesso' });
        } catch (err) {
            console.error('Erro ao conectar com Supabase:', err);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    } else {
        return res.status(405).json({ message: 'Método não permitido' });
    }
}
