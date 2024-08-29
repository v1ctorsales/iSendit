import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function updateLocalidade(req, res) {
    if (req.method === 'POST') {
        const { oldName, newName, empresa } = req.body;

        if (!oldName || !newName || !empresa) {
            return res.status(400).json({ message: 'Dados incompletos' });
        }

        // Primeiro, verifica se já existe uma localidade com o novo nome
        const { data: localidadesComMesmoNome, error: searchError } = await supabase
            .from('localidades')
            .select('*')
            .eq('nome', newName)
            .eq('empresa', empresa);

        if (searchError) {
            console.error('Erro ao buscar por localidades duplicadas:', searchError);
            return res.status(500).json({ message: 'Erro ao verificar localidades duplicadas' });
        }

        // Se já existe alguma localidade com o novo nome, retorna erro
        if (localidadesComMesmoNome.length > 0) {
            return res.status(409).json({ message: 'Já existe uma localidade com esse nome' });
        }

        // Se não há duplicidade, procede com a atualização
        const { data: updatedLocalidade, error: updateError } = await supabase
            .from('localidades')
            .update({ nome: newName })
            .eq('nome', oldName)
            .eq('empresa', empresa);

        if (updateError) {
            console.error('Erro ao atualizar localidade:', updateError);
            return res.status(500).json({ message: 'Erro ao atualizar localidade' });
        }

        res.status(200).json({ message: 'Localidade atualizada com sucesso', data: updatedLocalidade });
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
