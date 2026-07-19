import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/baixar")({
  component: BaixarPage,
  head: () => ({
    meta: [
      { title: "Baixar o Acessofast — app de acesso remoto para Windows" },
      {
        name: "description",
        content:
          "Baixe o aplicativo Acessofast para Windows e receba suporte remoto do seu time de TI, com a sua autorização. Sem cadastro.",
      },
    ],
  }),
});

const steps = [
  "Baixe e abra o instalador do Acessofast.",
  "Informe o ID e a senha exibidos ao seu técnico.",
  "Pronto — o atendimento começa com a sua autorização.",
];

function BaixarPage() {
  return (
    


      


      
        
          Recebeu um pedido de suporte?
        
        


          Baixe o Acessofast
        


        


          Instale o aplicativo, informe seu ID ao técnico e pronto. Sem cadastro, sem configuração.
        


        


          {/* TODO: trocar href="#" pela URL real do instalador quando publicado */}
          
            href="#"
            className="group inline-flex h-14 items-center gap-3 rounded-btn bg-primary px-8 text-base font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover hover:-translate-y-[1px]"
          >
            
            Baixar para Windows
          
        


        

Windows 10 ou superior · instalador .exe



        


          {steps.map((s, i) => (
            


              
                {i + 1}
              
              

{s}


            


          ))}
        


        


          
            ← Voltar para o site
          
        


      
      


    


  );
}
