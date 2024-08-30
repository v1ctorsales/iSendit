import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Substitua pelos valores da sua configuração Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseEmailPw = process.env.EMAIL_PW;
const supabaseEmail = process.env.EMAIL;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function sendFormFW(req, res) {
    if (req.method === 'POST') {
        const { regrafw, nomeRegra, porta, interfaceOrigem, interfaceDestino, objetoorigem, objetodestino, desc, action, localidade } = req.body;

        console.log('Tipo do Form:', regrafw);
        console.log('Nome da Regra:', nomeRegra);
        console.log('Porta:', porta);
        console.log('Interface Origem:', interfaceOrigem);
        console.log('Interface Destino:', interfaceDestino);
        console.log('Objeto Origem:', objetoorigem);
        console.log('Objeto Destino:', objetodestino);
        console.log('Descrição:', desc);
        console.log('Ação:', action);
        console.log('Localidade:', localidade); // Verifica se localidade está sendo recebido

        // Verifica se localidade está presente
        if (!localidade) {
            return res.status(400).json({ message: 'Localidade é obrigatória' });
        }

        // Insere os dados na tabela 'tasks'
        const { data, error } = await supabase
            .from('tasks')
            .insert([
                {
                    autor: 'victor@teste.com',
                    nome: nomeRegra,
                    descricao: desc,
                    type: regrafw,
                    porta,
                    interface_origem: interfaceOrigem,
                    interface_destino: interfaceDestino,
                    objeto_origem: objetoorigem,
                    objeto_destino: objetodestino,
                    acao: action === "accept" ? 1 : 0,
                    localidade // Inclui a localidade na inserção
                }
            ]);

        if (error) {
            console.error('Erro ao inserir dados:', error);
            return res.status(500).json({ message: 'Erro ao salvar dados' });
        }

        // Configura o transportador de e-mail usando o Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Você pode usar outro serviço de e-mail
            auth: {
                user: supabaseEmail, // Substitua pelo seu e-mail
                pass: supabaseEmailPw, // Substitua pela sua senha ou token de aplicação
            },
        });

        // Define as opções do e-mail
        const mailOptions = {
            from: {EMAIL}, // Substitua pelo seu e-mail
            to: 'victor.alves.sales@hotmail.com', // Substitua pelo e-mail do destinatário
            subject: 'Nova solicitação de regra de Firewall criada',
            text: `Uma nova solicitação foi criada com os seguintes detalhes:
            
            Localidade: "${localidade}"
            Nome da Regra: "${nomeRegra}"
            Interface Origem: "${interfaceOrigem}"
            Interface Destino: "${interfaceDestino}"
            Objeto Origem: "${objetoorigem}"
            Objeto Destino: "${objetodestino}"
            Ação: "${action === "accept" ? "Aceitar" : "Recusar"}"
            Descrição: "${desc}"

            Essa solicitação foi criada com sucesso.`,
        };

        // Envia o e-mail
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
