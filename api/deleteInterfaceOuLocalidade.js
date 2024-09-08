import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function deleteInterfaceOuLocalidade(req, res) {
    if (req.method === 'POST') {
        const { type, nome, localidade, empresa } = req.body;

        // Verificação para garantir que todos os dados necessários estejam presentes
        if (!type || !nome || !empresa || (type === 'interfaces' && !localidade)) {
            return res.status(400).json({ message: 'Dados incompletos' });
        }

        try {
            if (type === 'interfaces') {
                // Excluir interface filtrando por nome, localidade e empresa
                const { data, error } = await supabase
                    .from('interfaces')
                    .delete()
                    .match({ nome, localidade, empresa });

                if (error) {
                    console.error('Erro ao excluir interface:', error);
                    return res.status(500).json({ message: 'Erro ao excluir interface' });
                }

                return res.status(200).json({ success: true, message: 'Interface excluída com sucesso' });

            } else if (type === 'localidades') {
                // Deletar todas as interfaces associadas à localidade
                const { error: deleteInterfacesError } = await supabase
                    .from('interfaces')
                    .delete()
                    .match({ localidade: nome, empresa });

                if (deleteInterfacesError) {
                    console.error('Erro ao excluir interfaces associadas:', deleteInterfacesError);
                    return res.status(500).json({ message: 'Erro ao excluir interfaces associadas' });
                }

                // Deletar a localidade associada à empresa
                const { error: deleteLocalidadeError } = await supabase
                    .from('localidades')
                    .delete()
                    .match({ nome, empresa });

                if (deleteLocalidadeError) {
                    console.error('Erro ao excluir localidade:', deleteLocalidadeError);
                    return res.status(500).json({ message: 'Erro ao excluir localidade' });
                }

                return res.status(200).json({ success: true, message: 'Localidade e interfaces associadas excluídas com sucesso' });

            } else {
                return res.status(400).json({ message: 'Tipo de exclusão inválido' });
            }

        } catch (err) {
            console.error('Erro ao conectar com Supabase:', err);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
    } else {
        return res.status(405).json({ message: 'Método não permitido' });
    }
}
