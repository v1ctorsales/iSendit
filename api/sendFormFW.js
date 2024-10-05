import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do e-mail
const supabaseEmailPw = process.env.EMAIL_PW;
const supabaseEmail = process.env.EMAIL;

export default async function sendFormFW(req, res) {
    if (req.method === 'POST') {
        const { uuid, regrafw, nomeRegra, porta, nat, interfaceOrigem, interfaceDestino, objetoorigem, objetodestino, desc, obs, action, localidade, empresaPai, status } = req.body;

        if (!localidade) {
            return res.status(400).json({ message: 'Localidade é obrigatória' });
        }

        // Transformar o valor do NAT em binário (0 para desativado, 1 para ativado)
        const natBinary = nat === 'enable' ? 1 : 0;

        const { data: empresaFilhaData, error: empresaFilhaError } = await supabase
            .from('empresas')
            .select('nome, empresaPai_uuid')
            .eq('uuid', uuid)
            .single();

        if (empresaFilhaError) {
            console.error('Erro ao obter dados da empresa filha:', empresaFilhaError);
            return res.status(500).json({ message: 'Erro ao obter dados da empresa filha' });
        }

        const empresaNome = empresaFilhaData?.nome;
        const empresaPaiUuid = empresaFilhaData?.empresaPai_uuid;

        let empresaPaiNome = null;
        let empresaPaiEmail = null;
        if (empresaPaiUuid) {
            const { data: empresaPaiData, error: empresaPaiError } = await supabase
                .from('empresas')
                .select('nome, email')
                .eq('uuid', empresaPaiUuid)
                .single();

            if (empresaPaiError) {
                console.error('Erro ao obter dados da empresa pai:', empresaPaiError);
                return res.status(500).json({ message: 'Erro ao obter dados da empresa pai' });
            }

            empresaPaiNome = empresaPaiData?.nome;
            empresaPaiEmail = empresaPaiData?.email;
        }

        // Função para formatar campos que podem ter múltiplos valores com aspas ao redor de cada valor sem vírgula
        // Função para formatar campos que podem ter múltiplos valores com aspas ao redor de cada valor e aplicar a cor
        const formatMultipleValues = (value) => {
            if (typeof value === 'string') {
                // Se o valor contém múltiplos itens separados por vírgula, dividir, adicionar aspas e estilização
                return value.split(',').map(item => `<span style='color: #FFB86C;'>"${item.trim()}"</span>`).join(' ');
            }
            // Se for um único valor (não string ou sem vírgula), adicionar aspas e estilização
            return `<span style='color: #FFB86C;'>"${value}"</span>`;
        };
        

// Script estilizado para salvar no banco e enviar por e-mail
let firewallScript = `config firewall policy
&nbsp;&nbsp;&nbsp;&nbsp;edit 0
&nbsp;&nbsp;&nbsp;&nbsp;set name <span style='color: #FFB86C;'>"${nomeRegra}"</span>
&nbsp;&nbsp;&nbsp;&nbsp;set srcintf <span style='color: #FFB86C;'>"${interfaceOrigem}"</span>
&nbsp;&nbsp;&nbsp;&nbsp;set dstintf <span style='color: #FFB86C;'>"${interfaceDestino}"</span>
&nbsp;&nbsp;&nbsp;&nbsp;set action <span style='color: #FFB86C;'>"${action === "accept" ? "accept" : "deny"}"</span>
&nbsp;&nbsp;&nbsp;&nbsp;set srcaddr ${formatMultipleValues(objetoorigem)}
&nbsp;&nbsp;&nbsp;&nbsp;set dstaddr ${formatMultipleValues(objetodestino)}
&nbsp;&nbsp;&nbsp;&nbsp;set schedule <span style='color: #FFB86C;'>"always"</span>
&nbsp;&nbsp;&nbsp;&nbsp;set service ${formatMultipleValues(porta)}
&nbsp;&nbsp;&nbsp;&nbsp;set nat <span style='color: #FFB86C;'>"${natBinary === 1 ? 'enable' : 'disable'}"</span>`;

if (desc.trim() !== '') {
    firewallScript += `
&nbsp;&nbsp;&nbsp;&nbsp;set comment <span style='color: #FFB86C;'>"${desc}"</span>`;
}

firewallScript += `
next
end`;

// Agora, o restante do código permanece o mesmo...


        console.log('Script gerado:', firewallScript.trim());

        // Inserção no banco de dados com script estilizado
        const { data, error } = await supabase
            .from('tasks')
            .insert([
                {
                    status: status,
                    autor: 'victor@teste.com',
                    nome: nomeRegra,
                    descricao: desc,
                    observacao: obs,
                    type: regrafw,
                    porta: porta,
                    nat: natBinary, // Insere o valor do NAT como binário
                    interface_origem: interfaceOrigem,
                    interface_destino: interfaceDestino,
                    objeto_origem: objetoorigem,
                    objeto_destino: objetodestino,
                    acao: action === "accept" ? 1 : 0,
                    localidade,
                    empresa_origem: empresaNome,
                    empresa_destino: empresaPaiNome,
                    empresa_origem_uuid: uuid,
                    empresa_destino_uuid: empresaPai,
                    script: firewallScript.trim(),  // Salva o script gerado com estilização
                }
            ]);

        if (error) {
            console.error('Erro ao inserir dados:', error);
            return res.status(500).json({ message: 'Erro ao salvar dados' });
        }

        let observacaoHtml = '';
        if (obs && obs.trim() !== '') {
            observacaoHtml = `
<hr />
<p><strong>Observação:</strong></p>
<p style="background-color: #f0f0f0; padding: 10px;">${obs}</p>`;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: supabaseEmail,
                pass: supabaseEmailPw,
            },
        });

        const mailOptions = {
            from: supabaseEmail,
            to: empresaPaiEmail,
            subject: '[ISENDIT] Nova solicitação de regra de Firewall criada',
            html: `
        <h2>Script para a criação da regra:</h2>
        <pre id="firewallScript" style="padding: 15px; background-color: #282A36; color:#50FA7B; font-size: medium ; 
        font-family: Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace;">
        ${firewallScript.trim()}
        </pre>
        
        Mais informações em: <a href="https://www.isendit.com.br" target="_blank">https://www.isendit.com.br</a><hr />
        <h2>Informações detalhadas:</h2>
        <p><strong>Localidade:</strong> "${localidade}"</p>
        <p><strong>Nome da Regra:</strong> "${nomeRegra}"</p>
        <p><strong>Interface Origem:</strong> "${interfaceOrigem}"</p>
        <p><strong>Interface Destino:</strong> "${interfaceDestino}"</p>
        <p><strong>Objeto Origem:</strong> "${objetoorigem}"</p>
        <p><strong>Objeto Destino:</strong> "${objetodestino}"</p>
        <p><strong>Ação:</strong> "${action === "accept" ? "Aceitar" : "Recusar"}"</p>
        <p><strong>Porta:</strong> "${porta}"</p>
        <p><strong>NAT:</strong> "${natBinary === 1 ? 'Ativado' : 'Desativado'}"</p>
        <p><strong>Descrição:</strong> "${desc}"</p>
        ${observacaoHtml}
        <hr />
        <p>Este email foi enviado através da plataforma iSendit</p>
            `,
        };
        

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Erro ao enviar e-mail:', err);
                return res.status(500).json({ message: 'Erro ao enviar e-mail' });
            } else {
                console.log('E-mail enviado:', info.response);
                return res.status(200).json({ message: 'Dados recebidos e salvos com sucesso, e-mail enviado!' });
            }
        });
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
