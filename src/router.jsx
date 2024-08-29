import Form from "./components/Form";
import FormRegraFW from "./components/FormRegraFW";
import FormConfigurar from "./components/FormConfiguracoes";


function FirewallPage() {
    return <FormRegraFW />
}

function ObjetosPage() {
    return <Form />;
}

function EnviosPage() {
    return <h2>Página de Visualização de Envios</h2>;
}

function ConfiguracoesPage() {
    return <FormConfigurar />
}

function AjudaPage() {
    return <h2>Página de Ajuda</h2>;
}

export {
    FirewallPage,
    ObjetosPage,
    EnviosPage,
    ConfiguracoesPage,
    AjudaPage
};
