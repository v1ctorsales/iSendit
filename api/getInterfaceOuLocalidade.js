import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function getInterfaceOuLocalidade(req, res) {
    if (req.method === 'GET') {
        const { type, localidade, empresa } = req.query;  // Agora recebendo o UUID da empresa pelo query

        if (!type) {
            console.error('Tipo de consulta não especificado');
            return res.status(400).json({ message: 'Tipo de consulta não especificado' });
        }

        if (!empresa) {
            console.error('UUID da empresa não especificado');
            return res.status(400).json({ message: 'UUID da empresa não especificado' });
        }

        try {
            let data, error;
            if (type === 'interfaces') {
                console.log(`Buscando interfaces para localidade: ${localidade} e empresa: ${empresa}`);
                if (!localidade) {
                    console.error('Localidade não especificada');
                    return res.status(400).json({ message: 'Localidade não especificada' });
                }
                ({ data, error } = await supabase
                    .from('interfaces')
                    .select('nome')
                    .eq('localidade', localidade)
                    .eq('empresa', empresa));  // Filtra também pela empresa
            } else if (type === 'localidades') {
                ({ data, error } = await supabase
                    .from('localidades')
                    .select('nome')
                    .eq('empresa', empresa));  // Filtra pela empresa
            } else {
                console.error('Tipo de consulta inválido');
                return res.status(400).json({ message: 'Tipo de consulta inválido' });
            }

            if (error) {
                console.error(`Erro ao buscar dados em ${type}:`, error);
                return res.status(500).json({ message: `Erro ao buscar dados em ${type}` });
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
