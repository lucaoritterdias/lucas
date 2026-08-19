"use client";

import { Avatar } from "./Avatar";
import { Modal } from "./Modal";
import { PROFILE } from "../data";
import {
  IconArrowUpRight,
  IconArticle,
  IconClose,
  IconGithub,
  IconInstagram,
  IconMail,
  IconPhone,
  IconWhatsapp,
} from "./icons";

export function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal variant="card" onClose={onClose} labelledBy="about-title">
      <div className="card-cover">
        <button type="button" className="card-close" onClick={onClose} aria-label="Fechar">
          <IconClose />
        </button>
        <div className="card-avatar">
          <span>
            <Avatar view="head" idSuffix="about" />
          </span>
        </div>
      </div>

      <div className="card-body scroll-thin">
        <h2 className="card-name" id="about-title">
          {PROFILE.name}
        </h2>

        <div className="stat-row">
          <div className="stat">
            <b>+10</b>
            <span>Anos de código</span>
          </div>
          <div className="stat">
            <b>CTO</b>
            <span>Polvor</span>
          </div>
          <div className="stat">
            <b>2</b>
            <span>Empresas fundadas</span>
          </div>
        </div>

        <div className="card-text">
          <p>
            Formado em Análise e Desenvolvimento de Sistemas pela Unisinos, atuo com desenvolvimento
            de software desde os 14 anos. A trajetória começou criando sites em WordPress —
            plataforma na qual desenvolvi conhecimento técnico profundo e que serviu de base para
            todo o resto.
          </p>
          <p>
            Trabalhei como freelancer em diversos projetos e passei por uma multinacional na área de
            infraestrutura de TI, sempre mantendo o foco em soluções próprias e na manutenção de
            sistemas para clientes. Depois, deixei o estágio para transformar essa atuação em
            operação estruturada: a R&amp;D Sistemas, que em um ano e meio evoluiu para a{" "}
            <a href={PROFILE.companyUrl} target="_blank" rel="noreferrer">
              Polvor Tecnologia e Software
            </a>
            .
          </p>
          <p>
            Hoje, como CTO e sócio, lidero desenvolvimento, arquitetura de sistemas, infraestrutura e
            inovação — combinando experiência técnica com visão de negócio. A sociedade com Jean e
            Gisele, da Job Content, fortaleceu a visão de longo prazo da empresa.
          </p>
          <p>Quer discutir um projeto? Vamos começar :)</p>
        </div>

        <a className="btn-primary" href={PROFILE.whatsapp} target="_blank" rel="noreferrer">
          Chamar no WhatsApp
          <IconArrowUpRight />
        </a>

        <a className="btn-row" href={`mailto:${PROFILE.email}`}>
          <span className="btn-row-icon">
            <IconMail />
          </span>
          <span className="btn-row-body">
            <b>Enviar um e-mail</b>
            <span>{PROFILE.email}</span>
          </span>
          <IconArrowUpRight />
        </a>

        <a className="btn-row" href={`tel:${PROFILE.phoneRaw}`}>
          <span className="btn-row-icon">
            <IconPhone />
          </span>
          <span className="btn-row-body">
            <b>Ligar</b>
            <span>{PROFILE.phonePretty}</span>
          </span>
          <IconArrowUpRight />
        </a>

        <div className="card-socials">
          <a href={PROFILE.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <IconGithub />
          </a>
          <a href={PROFILE.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
            <IconInstagram />
          </a>
          <a href={PROFILE.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp">
            <IconWhatsapp />
          </a>
          <a href={PROFILE.blog} target="_blank" rel="noreferrer" aria-label="Artigos">
            <IconArticle />
          </a>
          <a href={`mailto:${PROFILE.email}`} aria-label="E-mail">
            <IconMail />
          </a>
        </div>
      </div>
    </Modal>
  );
}
