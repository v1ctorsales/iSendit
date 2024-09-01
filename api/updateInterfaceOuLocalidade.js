import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function updateItem(req, res) {
    if (req.method === 'POST') {
        const { type, oldName, newName, localidade, empresa } = req.body;

        if (!type || !oldName || !newName || (type === 'interfaces' && !localidade) || (type === 'localidades' && !empresa)) {
            return res.status(400).json({ message: 'Dados incompletos' });
        }

        if (type === 'interfaces') {
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
        } else if (type === 'localidades') {
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
            res.status(400).json({ message: 'Tipo inválido' });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
