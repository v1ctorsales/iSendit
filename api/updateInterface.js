import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function updateInterface(req, res) {
    if (req.method === 'POST') {
        const { oldName, newName, localidade } = req.body;

        if (!oldName || !newName || !localidade) {
            return res.status(400).json({ message: 'Dados incompletos' });
        }

        // Primeiro, verifica se já existe uma interface com o novo nome para a mesma localidade
        const { data: interfacesComMesmoNome, error: searchError } = await supabase
            .from('interfaces')
            .select('*')
            .eq('nome', newName)
            .eq('localidade', localidade);

        if (searchError) {
            console.error('Erro ao buscar por interfaces duplicadas:', searchError);
            return res.status(500).json({ message: 'Erro ao verificar interfaces duplicadas' });
        }

        // Se já existe alguma interface com o novo nome, retorna erro
        if (interfacesComMesmoNome.length > 0) {
            return res.status(409).json({ message: 'Já existe uma interface com esse nome nessa localidade' });
        }

        // Se não há duplicidade, procede com a atualização
        const { data: updatedInterface, error: updateError } = await supabase
            .from('interfaces')
            .update({ nome: newName })
            .eq('nome', oldName)
            .eq('localidade', localidade);

        if (updateError) {
            console.error('Erro ao atualizar interface:', updateError);
            return res.status(500).json({ message: 'Erro ao atualizar interface' });
        }

        res.status(200).json({ message: 'Interface atualizada com sucesso', data: updatedInterface });
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
