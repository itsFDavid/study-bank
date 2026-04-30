--
-- PostgreSQL database dump
--

\restrict BQioBgsGGliTi6gZFbs9K7JIQKq8l9qXN6g2r5FnvGaXX43fC5obtwmioQxuKqw

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 17.6

-- Started on 2026-04-29 20:58:37 CST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE "study-bank-dbsdb";
--
-- TOC entry 3431 (class 1262 OID 16384)
-- Name: study-bank-dbsdb; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE "study-bank-dbsdb" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE "study-bank-dbsdb" OWNER TO postgres;

\unrestrict BQioBgsGGliTi6gZFbs9K7JIQKq8l9qXN6g2r5FnvGaXX43fC5obtwmioQxuKqw
\encoding SQL_ASCII
\connect -reuse-previous=on "dbname='study-bank-dbsdb'"
\restrict BQioBgsGGliTi6gZFbs9K7JIQKq8l9qXN6g2r5FnvGaXX43fC5obtwmioQxuKqw

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 16398)
-- Name: Bank; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Bank" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Bank" OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16406)
-- Name: Question; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Question" (
    id text NOT NULL,
    "questionText" text NOT NULL,
    options text[],
    explanation text,
    "bankId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    answers text[]
);


ALTER TABLE public."Question" OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 16389)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 3424 (class 0 OID 16398)
-- Dependencies: 215
-- Data for Name: Bank; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Bank" VALUES ('cmkjctqoi0000625gsps9lbi9', 'GCP ACE', NULL, '2026-01-18 06:27:37.171', '2026-01-18 06:27:37.171');
INSERT INTO public."Bank" VALUES ('cmo7g91fm0000th0p4p9lc3ls', 'AWS Solutions Architech', NULL, '2026-04-20 17:09:05.024', '2026-04-20 17:09:05.024');


--
-- TOC entry 3425 (class 0 OID 16406)
-- Dependencies: 216
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Question" VALUES ('cmkjcufqh000162mlc3cwzgyd', 'Acabas de crear un objeto Secret en Kubernetes para guardar una contraseña. Un hacker logra entrar a tu cluster y descarga el YAML. En el campo data ve una cadena rara. ¿Puede leer la contraseña?', '{"No, porque Kubernetes encripta los secretos con algoritmos militares AES-256 por defecto.","Sí, porque Kubernetes solo los codifica en Base64 (que es reversible fácilmente), no los encripta por defecto.","No, necesita la llave privada del cluster para decodificarlo.","Sí, pero solo si tiene permisos de Root en el nodo."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-18 06:28:09.641', '{"Sí, porque Kubernetes solo los codifica en Base64 (que es reversible fácilmente), no los encripta por defecto."}');
INSERT INTO public."Question" VALUES ('cmkjcufw0000362ml0gl7uk9n', 'Estás creando un Deployment. En la sección ''spec.selector.matchLabels'' pones ''app: tienda'', pero en ''spec.template.metadata.labels'' pones ''app: almacen''. ¿Qué pasará al aplicar el YAML?', '{"Se crearán los pods correctamente pero tendrán otra etiqueta.","Kubernetes lanzará un error de validación diciendo que el selector no coincide con las etiquetas del template.","Se creará un Deployment Zombie que generará pods infinitos.","Kubernetes corregirá automáticamente la etiqueta para que coincidan."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-18 06:28:09.841', '{"Kubernetes lanzará un error de validación diciendo que el selector no coincide con las etiquetas del template."}');
INSERT INTO public."Question" VALUES ('cmkjcufyn000562ml3prux1t8', 'Si un Pod supera el límite de Memoria RAM (Limits) configurado en el YAML, ¿qué acción toma Kubernetes?', '{"Comprime la memoria para que quepa en el límite (Throttling).","Mueve el pod a otro nodo con más RAM.","Ignora el límite si hay espacio libre en el nodo.","Mata el contenedor inmediatamente (OOMKilled)."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-18 06:28:09.935', '{"Mata el contenedor inmediatamente (OOMKilled)."}');
INSERT INTO public."Question" VALUES ('cmkjcug1z000762mlb1ce9rvh', 'Tienes una regla de firewall en GCP que permite el tráfico de ENTRADA (Ingress) al puerto 80. Un usuario entra a tu web. ¿Necesitas crear una regla de SALIDA (Egress) explícita para que el servidor pueda responder?', '{"Sí, siempre hay que configurar entrada y salida explícitamente en cualquier nube.","No, los firewalls de GCP son ''Stateful'' (con estado) y permiten la respuesta automáticamente.","Sí, pero solo si el tráfico es UDP.","No, porque el tráfico de salida está permitido por defecto solo para el puerto 80."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-18 06:28:10.055', '{"No, los firewalls de GCP son ''Stateful'' (con estado) y permiten la respuesta automáticamente."}');
INSERT INTO public."Question" VALUES ('cmkjcug4p000962mljd3xrtly', 'Estás configurando IAM. Quieres que ''Ana'' pueda ver las máquinas virtuales del ''Proyecto-A'', pero que NO pueda ver otros recursos en la carpeta ''Desarrollo''. ¿Cuál es la mejor práctica?', '{"Darle el rol ''Owner'' a nivel de Proyecto-A.","Darle el rol ''Compute Viewer'' a nivel de la Carpeta Desarrollo.","Darle el rol ''Compute Viewer'' a nivel del Proyecto-A.","Darle el rol ''Viewer'' (Básico) a nivel del Proyecto-A."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-18 06:28:10.153', '{"Darle el rol ''Compute Viewer'' a nivel del Proyecto-A."}');
INSERT INTO public."Question" VALUES ('cmkjcug8b000b62ml0s9jdvv6', 'Necesitas conectar una base de datos en una subred de ''us-central1'' con un servidor en ''asia-east1'' usando IPs privadas dentro de la misma VPC. ¿Qué necesitas configurar?', '{"Una Cloud VPN entre las regiones.","VPC Network Peering.","Nada. En GCP las VPC son globales y las subredes se ven automáticamente.","Un Global Load Balancer."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-18 06:28:10.283', '{"Nada. En GCP las VPC son globales y las subredes se ven automáticamente."}');
INSERT INTO public."Question" VALUES ('cmkjcugb0000d62mlztawlf4r', 'Tienes logs de aplicaciones que debes guardar por auditoría legal durante 5 años. Los primeros 15 días se consultan mucho para depurar errores, luego casi nunca. ¿Cuál es la estrategia de costos más eficiente?', '{"Crear el bucket en clase Archive desde el día 1.","Crear en Standard. Regla de ciclo de vida: mover a Nearline a los 15 días y a Archive al año.","Crear en Standard. Regla de ciclo de vida: mover a Archive a los 15 días.","Crear en Coldline y mover a Archive a los 5 años."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-18 06:28:10.38', '{"Crear en Standard. Regla de ciclo de vida: mover a Archive a los 15 días."}');
INSERT INTO public."Question" VALUES ('cmkjcugdp000f62mlgdz0odef', 'Tienes un proceso ''Batch'' que procesa imágenes. Tarda 5 horas, pero si se interrumpe puede reiniciarse sin perder datos. Quieres ahorrar el máximo dinero posible. ¿Qué tipo de máquina usas?', '{E2-Standard.,"Spot VMs (o Preemptible).",N2-HighCpu.,"C2-Compute Optimized."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-18 06:28:10.478', '{"Spot VMs (o Preemptible)."}');
INSERT INTO public."Question" VALUES ('cmkjcuggc000h62ml4f6aa9aq', '¿Cuál es el comando correcto para crear un nuevo cluster de Kubernetes (GKE) en Google Cloud desde la terminal?', '{"kubectl create cluster mi-cluster --zone us-central1-a","gcloud container clusters create mi-cluster --zone us-central1-a","gcloud kubernetes create cluster mi-cluster --zone us-central1-a","kubectl apply -f cluster.yaml"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-18 06:28:10.573', '{"gcloud container clusters create mi-cluster --zone us-central1-a"}');
INSERT INTO public."Question" VALUES ('cmkjcugj1000j62mlnkfzpt2e', 'Una aplicación en una VM necesita leer archivos de un Cloud Storage Bucket privado. ¿Cuál es la forma MÁS segura de dar acceso?', '{"Crear una Service Account, descargar la key JSON y ponerla en el código.","Hacer el bucket público (allUsers) con rol Viewer.","Loguearte con ''gcloud auth login'' en la VM con tu cuenta personal.","Crear una Service Account y vincularla (attach) a la configuración de la VM."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-18 06:28:10.67', '{"Crear una Service Account y vincularla (attach) a la configuración de la VM."}');
INSERT INTO public."Question" VALUES ('cmkjcugmh000l62mljw4gm2oz', 'Tienes dos VPCs en proyectos diferentes (Principal y Startup). Necesitas que se comuniquen por IP Privada con la MÁXIMA velocidad de red posible y sin salir a internet. ¿Qué usas?', '{"Cloud VPN.","VPC Network Peering.","Reglas de Firewall permitiendo las IPs públicas.","Cloud Interconnect."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-18 06:28:10.793', '{"VPC Network Peering."}');
INSERT INTO public."Question" VALUES ('cmkld0t0o0001ms0phe65bk3i', 'You have a Dockerfile that you need to deploy on Kubernetes Engine. What should you do?', '{"Use kubernetes app deploy.","Use g-cloud app deploy.","Create a docker image from the Dockerfile and upload it to a Container registry. Create a deployment YAML file to point to that image. Use kubernetes to create the deployment with that file.","Create a docker image from Dockefile and upload it to a Cloud Storage. Create a deployment YAML file to point to that image. Use kubernetes to create the deployment with that file."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 16:08:39.143', '{"Create a docker image from the Dockerfile and upload it to a Container registry. Create a deployment YAML file to point to that image. Use kubernetes to create the deployment with that file."}');
INSERT INTO public."Question" VALUES ('cmklfzccm0003ms0poisz4neu', 'You have a development project with appropiate IAM roles defined. You are creating a production project and want to have the same AIM roles on the new project, using the fewest possible steps. What should you do?', '{"Use g-cloud IAM roles copy and specify the production project as the destination project.","Use g-cloud IAM roles copy and specify your organization as the destination organization.","In the Google Cloud Platform console, use the create role from role functionality.","In the Google Cloud Platform console, use the create role functionality and select all the applicable permissions."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 17:31:29.735', '{"Use g-cloud IAM roles copy and specify the production project as the destination project."}');
INSERT INTO public."Question" VALUES ('cmklg6gue0005ms0pyjpnrgpt', 'You need a dynamic way of provisioning VMs on Compute Engine. The exact specifications will be in a dedicated configuration file. You want to follow Google''s recommended practices. Which method should you use?', '{"Deployment Manager","Cloud Composer","Managed Instance Group","Unmanaged Instance Group"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 17:37:02.15', '{"Deployment Manager"}');
INSERT INTO public."Question" VALUES ('cmklgtg8r0007ms0pxkag2pe3', '¿Que significa aprovisionamiento (alquiler) de recursos on-demand?', '{"Aprovisionamiento (alquiler) de recursos cuando los necesita y liberarlos cuando no los necesita.","Comprar servidores fisicos."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 17:54:54.46', '{"Aprovisionamiento (alquiler) de recursos cuando los necesita y liberarlos cuando no los necesita."}');
INSERT INTO public."Question" VALUES ('cmklgw07y0009ms0py8mnhh7f', '¿Cual de estas afirmaciones sobre una Region es VERDADERA?', '{"GCP tiene regiones en un solo pais.","GCP tiene regiones a traves de diferentes continentes.","GCP tiene regiones solo en un continente"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 17:56:53.662', '{"GCP tiene regiones a traves de diferentes continentes."}');
INSERT INTO public."Question" VALUES ('cmklgy94s000bms0p0mzlxczt', '¿Cual de estas es una zona de disponibilidad en la region de The Dallas, Oregón, Norteamerica -us-west1?', '{us-west1-a,europe-north-a}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 17:58:38.525', '{us-west1-a}');
INSERT INTO public."Question" VALUES ('cmklh0g03000dms0pvztazphe', '¿Cuales son las ventajas de la nube?', '{"Cambia los gastos de capital por gasto variable.","Beneficio economico en escalas masivamente.","No tienes que adivinar la capaciad que vas a necesitar.","Todas las anteriores"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:00:20.74', '{"Todas las anteriores"}');
INSERT INTO public."Question" VALUES ('cmklh3v78000fms0pfa2e2l4p', '¿Que representa el 2 en el tipo de maquina e2-standard-2?', '{"2 vCPUs","2 GB de memoria","Familia de maquina"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:03:00.404', '{"2 vCPUs"}');
INSERT INTO public."Question" VALUES ('cmklh9z7l000hms0pfgvaafde', '¿Cual de estas afirmaciones sobre las direcciones IP estaticas NO es verdadera?', '{"La direccion IP estatica NO se puede cambiar a otra instancia de VM en el mismo proyecto.","La direccion IP estatica permanece adjunta a la instancia incluso cuando esta se detiene.","Se le cobra por una direccion IP estatica cuando no se esta utilizando."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:07:45.538', '{"La direccion IP estatica NO se puede cambiar a otra instancia de VM en el mismo proyecto."}');
INSERT INTO public."Question" VALUES ('cmklhde1q000jms0p4959u22e', '¿Cual es la mejor opcion para reducir el tiempo de inicio de una instancia de VM?', '{"Intalar el software usando un script de inicio.","Utilizar una imagen personalizada.","Configurar un script de inicio en una plantilla de instancia."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:10:24.735', '{"Utilizar una imagen personalizada."}');
INSERT INTO public."Question" VALUES ('cmklhgmp7000lms0pmx0oyq8t', '¿Cual de estas afirmaciones sobre las Maquinas Preemtibles VM es verdadera?', '{"Pueden ser detenidas por GCP en cualquier momento dentro de 24 horas.","Las instancias reciben una advertencia de 30 segundos para reaccionar.","Las maquinas VM preemtibles son las opciones de VM mas baratas.","Todas las anteriores"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:12:55.915', '{"Todas las anteriores"}');
INSERT INTO public."Question" VALUES ('cmklhi5rp000nms0pdqly2x8f', '¿Cual de estas opciones se recomienda para ahorrar costos para un programa de tolerancia a fallas no critico?', '{"VM preemtible","Descuento por uso continuo"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:14:07.286', '{"VM preemtible"}');
INSERT INTO public."Question" VALUES ('cmklhljmg000pms0pck7csv5q', '¿Cual de estas metricas esta disponible de forma predeterminada (sin instalar el agente de monitoreo de la nube) para una maquina virtual del motor de calculo?', '{"Utilizacion de CPU.","Utilizacion de memoria.","Utilizacion de disco."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:16:45.209', '{"Utilizacion de CPU."}');
INSERT INTO public."Question" VALUES ('cmklhna7n000rms0ptpk86oh7', '¿Cual de estos comandos enumera todas las propiedades de la configuracion activa en GCloud?', '{"gcloud config list","gcloud init"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:18:06.323', '{"gcloud config list"}');
INSERT INTO public."Question" VALUES ('cmklhpp7s000tms0ps9mp4p2a', '¿Cual de estos comandos se utiliza para establecer el proyecto?', '{"gcloud config set core/project-my-project-abc","gcloud config set project project-my-project-abc",ambos}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:19:59.08', '{ambos}');
INSERT INTO public."Question" VALUES ('cmkli1e04000vms0pdxwdn3py', '¿Cual de estos comando tiene la mayor prioridad (para decidir la zona) al ejecutar un comando de gcloud?', '{"--zone, opcion especificada junto con el comando","Defines la zona con: gcloud config set compute/zone us-west-1a","Se define la configuracion centralizada con: gcloud compute project-info add-metadata"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:29:04.421', '{"--zone, opcion especificada junto con el comando"}');
INSERT INTO public."Question" VALUES ('cmkli33xd000xms0pmzmvl9cq', '¿Es verdadero o falso: Un grupo de instancias administradas puede contener VM''s creadas con diferentes tipos de maquinas?', '{Verdadero,Falso}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:30:24.673', '{Falso}');
INSERT INTO public."Question" VALUES ('cmkli4dh9000zms0pvsk4fx7w', '¿Es verdadero o falso: El grupo de instancias administradas proporciona capacidades de autocuracion y escalado automatico?', '{Verdadero,Falso}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:31:23.709', '{Verdadero}');
INSERT INTO public."Question" VALUES ('cmkli6gpq0011ms0pea4mq0lw', '¿Cual de estas opciones de configuracion puede prevenir operaciones de escalado frecuentes en una instancia de Gestion de Infraestructura (MIG)?', '{--health-check,--cool-down-period}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:33:01.215', '{--cool-down-period}');
INSERT INTO public."Question" VALUES ('cmkli9a5f0013ms0p61v2tl0k', 'Quiero hacer un nuevo lanzamiento sin reduccion de capacidad. ¿Cual de estas opciones debo configurar con un valor de 0?', '{--max-surge,--max-unavailable,--max-num-replicas}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:35:12.676', '{--max-unavailable}');
INSERT INTO public."Question" VALUES ('cmkliaux80015ms0p25lx3w2u', '¿Cual es servicio de orquestacion de contenedores administrado en Google Cloud?', '{"Compute Engine","Google Kubernetes Engine","App Engine","Cloud Functions"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:36:26.253', '{"Google Kubernetes Engine"}');
INSERT INTO public."Question" VALUES ('cmklid6cq0017ms0psml916em', '¿Cual de estos servicios se puede usar para construir aplicaciones impulsadas por eventos utilizando funciones de proposito unico simples en Google Cloud?', '{"Compute Engine","Google Kubernetes Engine","App Engine","Cloud Functions"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:38:14.379', '{"Cloud Functions"}');
INSERT INTO public."Question" VALUES ('cmklieugo0019ms0p8d7xoxle', '¿Cual de estos servicios se utiliza para crear maquinas virtuales en Google Cloud?', '{"Compute Engine","Google Kubernetes Engine","App Engine"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:39:32.28', '{"Compute Engine"}');
INSERT INTO public."Question" VALUES ('cmkligcxq001bms0pnydnpk4a', '¿Cuales son las ventajas de Docker?', '{"Los contenedores de Docker son ligeros.","Docker proporciona aislamiento para los contenedores","Docker es neutral en la nube","Todas las anteriores"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:40:42.878', '{"Todas las anteriores"}');
INSERT INTO public."Question" VALUES ('cmkliilrz001dms0p6jgwigvj', 'Google App Engine es un ejemplo de:', '{"IaaS (Infraestructura como Servicio)","PaaS (Plataforma como Servicio)","FaaS (Funcion como Servicio)"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:42:27.647', '{"PaaS (Plataforma como Servicio)"}');
INSERT INTO public."Question" VALUES ('cmklikrs1001fms0popypjt0k', '¿Es verdadero o falso que AppEngine Standard puede escalarse a cero instancias cuando no hay carga?', '{Verdadero,Falso}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:44:08.738', '{Verdadero}');
INSERT INTO public."Question" VALUES ('cmklim5o0001hms0pbh0vmv5s', '¿Es verdadero o falso que AppEngine Flexible ejecuta aplicaciones en entornos de sandbox especificos del lenguaje?', '{Verdadero,Falso}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:45:13.393', '{Falso}');
INSERT INTO public."Question" VALUES ('cmklio1uv001jms0pu67ys8qj', '¿Cuantas aplicaciones de AppEngine se pueden crear en un proyecto?', '{Una,"Todas las que quieras","10. Pero podrias crear mas si las solicitas"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:46:41.767', '{Una}');
INSERT INTO public."Question" VALUES ('cmkmokztr0024ms0pv88zjhaz', 'Estas usando multiples configuraciones para gcloud. Quieres revisar el cluster de Kubernetes Engine configurado en una configuracion inactiva utilizando la menor cantidad de pasos posibles. ¿Que debes hacer?', '{"Usa gcloud config configurations describe, para revisar el resultado","Usa gcloud config configurations activate y gcloud config list para revisar el resultado","Usa kubectl config get-context para revisar el resultado","Usa kubectl config use-context y kubectl config view para revisar el resultado"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-20 14:20:03.04', '{"Usa gcloud config configurations describe, para revisar el resultado"}');
INSERT INTO public."Question" VALUES ('cmkliqkzp001nms0pzzc4d6qm', '¿Que comando se utiliza para implementar una nueva version de un servicio de AppEngine sin migrar el trafico a la nueva version?', '{--no-promote,--no-migrate,--no-split}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:48:39.877', '{--no-promote}');
INSERT INTO public."Question" VALUES ('cmklisfv3001pms0pztamnd3v', '¿Que comando se usa para migrar el trafico gradualmente a la nueva version en AppEngine junto con el comando --splits?', '{--gradual,--migrate,--split}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:50:06.543', '{--migrate}');
INSERT INTO public."Question" VALUES ('cmkliwmuv001rms0pm3kzhkmc', '¿Cual de estos componentes de nodo de trabajo es responsable de la comunicacion con el nodo maestro?', '{Kubelet,Scheduler,etcd}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:53:22.232', '{Kubelet}');
INSERT INTO public."Question" VALUES ('cmkliy13c001tms0psq9bzxbs', '¿Es verdadero o falso que un Pod siempre tiene un solo contenedor?', '{Verdadero,Falso}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:54:27.337', '{Falso}');
INSERT INTO public."Question" VALUES ('cmklizozd001vms0p9wih7wjo', '¿Cual de estos componentes de Kubernetes es responsable de reemplazar un pod poco saludable?', '{Deployment,Service,Replicaset}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:55:44.954', '{Replicaset}');
INSERT INTO public."Question" VALUES ('cmklj1ywj001xms0p2h22j9rc', 'Si quieres ejecutar un pod en cada nodo para recoleccion  de registros o monitoreo. ¿Que componente de Kubernetes crearias?', '{Deployment,DaemonSet,ReplicaSet}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-19 18:57:31.124', '{DaemonSet}');
INSERT INTO public."Question" VALUES ('cmkmnz9l60020ms0p986majf2', 'Necesitas crear una VPC personalizada con una sola subred. El rango de la subred debe ser lo mas amplio posible. ¿Que rango debes usar?', '{0.0.0.0/0,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-20 14:03:09.257', '{10.0.0.0/8}');
INSERT INTO public."Question" VALUES ('cmkmow3a50026ms0p74hfb8w3', 'Tienes una aplicacion que busca su servidor de licencias en la IP 10.0.3.21. Necesitas desplegar el servidor de licencias en compute engine. No quieres cambiar la configuracion de la aplicacion y quieres que la aplicacion pueda alcanzar el servidor de licencias. ¿Que debes hacer?', '{"Reservar la IP 10.0.3.21 como una direccion interna estatica usando gcloud y asignarla al servidor de licencias","Reservar la IP 10.0.3.21 como una direccion IP publica estatica usando gcloud y asignarla al servidor de licencias","Usar la IP 10.0.3.21 como una direccion de IP efimera personalizada y asiganarla al servidor de licencias","Iniciar el servidor de licencias con una direccion IP efimera automatica y luego promocionarla a una direccion IP interna estatica."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-20 14:28:40.733', '{"Reservar la IP 10.0.3.21 como una direccion interna estatica usando gcloud y asignarla al servidor de licencias"}');
INSERT INTO public."Question" VALUES ('cmkmp0z650028ms0povtrla7l', 'Estas desplegando una aplicacion en App Engine. Quieres que el numero de instancias se escale segun la tasa de solicitudes. Necesitas al menos 3 instancias desocupadas en todo momento. ¿Que tipo de escalado deberias usar?', '{"Escalado automatico con 3 instancias","Escalado basico con min_instances establecido en 3","Escalado basico con mac_instances establecido en 3","Escalado automatico con min_idle_instances establecido en 3"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-20 14:32:28.685', '{"Escalado automatico con min_idle_instances establecido en 3"}');
INSERT INTO public."Question" VALUES ('cmkmpad7c002ams0plqtna1xn', 'Quieres configurar la autorecuperacion para el balanceo de carga de red en un grupo de instancias de compute engine que se ejecutan en varias zonas, utilizando la menor cantidad de pasos posibles. Necesitas configurar la recreacion de las maquinas virtuales si no responden despues de 3 intentos de 10 segundos cada uno. ¿Que debes hacer?', '{"Crea un balanceador de carga HTTP con una configuracion de backend que haga referencia a un grupo de instancias existente. Establece la verificacion de estado en \"saludable (HTTP)\"","Crea un balanceador de carga HTTP con una configuracion de backend que haga referencia  a un grupo de instancias existente. Define un modo de balanceo y establece RPS maximo en 10.","Crea un grupo de instancias administrado. Establece la configuracion de estado en autorecuperacion en \"saludable (HTTP)\"","Crea un grupo de instancias administrado. Verifica que la configuracion de escalado automatico este activada"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-20 14:39:46.776', '{"Crea un grupo de instancias administrado. Establece la configuracion de estado en autorecuperacion en \"saludable (HTTP)\""}');
INSERT INTO public."Question" VALUES ('cmkmpe2ns002cms0p7nh7jbwr', 'Tu empresa usa Cloud Storage para almacenar archivos de respaldo de aplicaciones para fines de recuperacion ante desastres. Quieres seguir las practicas recomendadas por Google. ¿Que opcion de almacenamiento deberias usar?', '{"Almacenamiento Multiregional","Almacenamiento Regional","Almacenamiento Nearline","Almacenamiento Coldline"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-20 14:42:39.737', '{"Almacenamiento Coldline"}');
INSERT INTO public."Question" VALUES ('cmkmpltdo002ems0pmh8i1idw', 'Varios empleados de tu empresa han estado creando proyectos en Cloud Platform y pagando con sus tarjetas de credito personales, las cuales la empresa les reembolsa. La empresa quiere centralizar todos estos proyectos bajo una nueva cuenta de facturacion unica. ¿Que debes hacer?', '{"Contactar cloud-billing@google.com con los detalles de tu cuenta bancaria y solicitar una cuenta de facturacion corporativa para tu empresa.","Crear un ticket con el soporte de google y esperar su llamada para compartir los detalles de tu tarjeta de credito por telefono","En la consola de Google Platform, ir a  \"Administrador de recursos\" y mover todos los proyectos a la Organizacion raiz","En la console Google Cloud Platform, crear una nueva cuenta de facturacion y configurar un metodo de pago"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-20 14:48:40.957', '{"En la console Google Cloud Platform, crear una nueva cuenta de facturacion y configurar un metodo de pago"}');
INSERT INTO public."Question" VALUES ('cmkmpt2a3002gms0pk7eeuxso', 'Quieres seleccionar y configurar una solucion rentable para datos relacionales en Google Cloud Platform. Estas trabajando con un pequeño conjunto de datos operativos en una ubicacion geografica. Necesitas admitir la recuperacion a un punto en el tiempo. ¿Que debes hacer?', '{"Selecciona Cloud SQL (MySQL). Verifica que la opcion de habilitar el registro binario este seleccionada","Selecciona Cloud SQL (MYSQL). Selecciona la opcion para crear replicas de conmutacion por error","Selecciona Cloud Spanner. Configura tu instancia con 2 nodos","Selecciona Cloud Spanner. Configura tu instancia como multiregional"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-20 14:54:19.083', '{"Selecciona Cloud SQL (MySQL). Verifica que la opcion de habilitar el registro binario este seleccionada"}');
INSERT INTO public."Question" VALUES ('cmkmq5tgp002ims0pkzr8rjkv', 'Necesitas actualizar un deployment en Deployment Manager sin ningun tiempo de inactividad en los recursos del deployment. ¿Que comando deberias usar?', '{"gcloud deployment-manager deployments create --config <deployment-config-path>","gcloud deployment-manager deployments update --config <deployment-config-path>","gcloud deployment-manager resources create --config <deployment-config-path>","gcloud deployment-manager resources update --config <deployment-config-path>"}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-20 15:04:14.186', '{"gcloud deployment-manager deployments update --config <deployment-config-path>"}');
INSERT INTO public."Question" VALUES ('cmo7jkgi1000ath0p3u5adnng', 'Un arquitecto de soluciones necesita asegurarse de que una instancia On-Demand de EC2 que aloja un servidor web solo pueda ser accedida desde esta direccion IP (203.145.76.89) a traves del puerto HTTP. ¿Cual de las siguientes soluciones satisfara el requisto?', '{"Regla de entrada en el Security Group: Protocolo - TCP, Rango de puertos - 80, Origen - 203.145.76.89/32","Regla de salida en el Security Group: Protocolo - UDP, Rango de puertos - 80, Origen - 203.145.76.89/32","Regla de entrada en el Security Group: Protocolo - UDP, Rango de puertos - 80, Origen - 203.145.76.89/32","Regla de salida en el Security Group: Protocolo - TCP, Rango de puertos - 80, Origen - 203.145.76.89/32"}', NULL, 'cmo7g91fm0000th0p4p9lc3ls', '2026-04-20 18:41:56.617', '{"Regla de entrada en el Security Group: Protocolo - TCP, Rango de puertos - 80, Origen - 203.145.76.89/32"}');
INSERT INTO public."Question" VALUES ('cmkmoaqar0022ms0pm3q60rc5', 'Cada empleado de tu empresa tiene una cuenta de Google. Tu equipo operativo necesita gestionar un gran numero de instancias Compute Engine. Cada miembro de este equipo solo necesita acceso administrativo a los servidores. Tu equipo de seguridad quiere asegurarse que el despliegue de credenciales sea eficiente operativamente y debe poder determinar quien accedio a una instancia dada. ¿Que debes hacer?', '{"Genera un nuevo par de claves SSH. Dale la clave privada a cada miembro de tu equipo. Configura la clave publica en los metadatos de cada instancia.","Pide a cada miembro del equipo que genere un nuevo par de claves SSH  y que te envie su clave publica. Usa una herramienta de gestion de configuracion para desplegar esas claves en cada instancia.","Pide a cada miembro del equipo que genere un nuevo par de claves SSH y que añada la clave publica a su cuenta de Google. Otorga rol compute.osAdminLogin al grupo de google correspondiente a este equipo.","Genera un nuevo par de claves SSH. Dale la clave privada a cada miembro de tu equipo. Configura la clave publica como una clave SSH publica a nivel de proyecto en tu proyecto de Cloud Platform y permite claves SSH publicas a nivel de proyecto en cada instancia."}', NULL, 'cmkjctqoi0000625gsps9lbi9', '2026-01-20 14:12:04.132', '{"Pide a cada miembro del equipo que genere un nuevo par de claves SSH y que añada la clave publica a su cuenta de Google. Otorga rol compute.osAdminLogin al grupo de google correspondiente a este equipo."}');
INSERT INTO public."Question" VALUES ('cmo7ghhg60002th0pbbs0zna9', 'Una empresa de comercio electronico esta expandiendo su infraestructura a nivel goblar y necesita una base de datos que pueda escalar automaticamente para manejar picos de trafico.

La base de datos debe ser altamente disponible, tolerante a fallos y permitir cambios en el esquema sin afectar el rendimiento. Ademas debe ofrecer tiempos de respuesta en milisegundos para consultas de alto trafico. ¿Cual es la solucion de base de datos mas adecuada para cumplir con este requisito?', '{"Una base de datos Amazon aurora a nivel global.","Una instancia de Amazon RDS en configuracion Multi-AZ con replicas de lectura","Amazon ElastiCache con Redis","Amazon DynamoDB con replicacion global"}', NULL, 'cmo7g91fm0000th0p4p9lc3ls', '2026-04-20 17:15:39.03', '{"Amazon DynamoDB con replicacion global"}');
INSERT INTO public."Question" VALUES ('cmo7i2g960004th0p6hpxfaz6', 'Una empresa de servicios financieros almacena datos sensibles de clientes en Amazon S3. Debido a regulaciones estrictas, las claves maestras utilizadas para cifrar los datos no deben almacenarse ni ser gestionadas por AWS. La empresa tambien quiere asegurarse de que los datos que se cifren antes deben ser transferidos a la nube. ¿ Que tecnica de cifrado de S3 debe utilizar el Solution Architect?', '{"Utilizar cifrado del lado del servidor S3 con claves administradas por AWS KMS","Utilizar cifrado del lado del servidor S3 con claves proporcionadas por el cliente (SSE-C)","Utilizar cifrado del lado del cliente S3 con una clave de cifrado administrada localmente","Utilizar cifrado del lado del servidor S3 con claves KMS controladas por AWS"}', NULL, 'cmo7g91fm0000th0p4p9lc3ls', '2026-04-20 17:59:56.875', '{"Utilizar cifrado del lado del cliente S3 con una clave de cifrado administrada localmente"}');
INSERT INTO public."Question" VALUES ('cmo7ipuj60006th0prj2pgs9h', 'Una empresa utiliza AWS Fargate para ejecutar un trabajo por lotes cuando se carga un objeto en un bucket de Amazon S3. La cantidad minima de ECS se establece inicialmete en 1 para ahorrar costos y solo debe aumentarse cuando se cargan nuevos objetos en el bucket de S3. ¿Cual es la opcion mas adecuada para implementar con el minimo esfuerzo?', '{"Configurar una regla de Amazon EventBridge (Amazon CloudWatch Events) para detectar operaciones PUT de objetos en S3 y establecer el destino en el cluster de ECS para ejuctar una nueva tarea de ECS","Configurar una alarma CloudWatch para monitorear operaciones a nivel de objeto en S3 registradas en CloudTrial. Establecer dos acciones de alarma para actualizar el recuento de tareas en ECS para escalar hacia arriba/abajo segun sea el evento de S3","Configurar una regla de Amazon EventBridge (Amazon CloudWatch Events) para detectar opecaciones PUT de objetos S3 y establecer el destino en una funcion Lamba que ejecutara el comando StartTask de la API","Configurar una alarma CloudWatch para monitorear opecaciones a nivel de objeto en S3 registradas en CloudTrial. Crear una regla de Amazon Bridge (Amazon CloudWatch Events) que active el cluster de ECS cuando se detecten nuevos nuevos eventos de CloudTrial."}', NULL, 'cmo7g91fm0000th0p4p9lc3ls', '2026-04-20 18:18:08.466', '{"Configurar una regla de Amazon EventBridge (Amazon CloudWatch Events) para detectar operaciones PUT de objetos en S3 y establecer el destino en el cluster de ECS para ejuctar una nueva tarea de ECS"}');
INSERT INTO public."Question" VALUES ('cmo7j94mn0008th0psf63zfcl', 'Una empresa de medios digitales necesita un volumen de almacenamiento en bloque para procesar archivos de video de alta resolucion. Los archivos originales deben almacenarse en un servicio de almacenamiento de objetos, y despues de 60 dias deben moverse a un servicio de archivo de datos para reducir costos. ¿Que debes hacer para cumplir con este requisito?', '{"Adjuntar un volumen de almacenamiento de instancia en la instancia EC2. Utilizar Amazon S3 para almacenar los arhcivos originales y configurar una politica de ciclo de vida para transaladarlos a Amazon S3 Standar-IA despues de 60 dias.","Adjuntar un volumen EBS en la instancia EC2. Utilizar Amazon S3 para almacenar los archivos originales y configurar un politica de ciclo de vida para trasladarlos a Amazon S3 Standar-IA despues de 60 dias","Adjuntar un volumen EBS en la instancia EC2. Utilizar Amazon S3 para almacenar los archivos originales y configurar una politca de ciclo de vida para trasladarlos a Amazon S3 Glacier despues de 60 dias","Adjuntar un volumen de almacenamiento de instancia en la instancia EC2. Utilizar Amazon S3 para almacenar los archivos originales y configurar una policita de ciclo de vida para transladarlos a Amazon S3 Glacier despues de 60 dias"}', NULL, 'cmo7g91fm0000th0p4p9lc3ls', '2026-04-20 18:33:08.016', '{"Adjuntar un volumen EBS en la instancia EC2. Utilizar Amazon S3 para almacenar los archivos originales y configurar una politca de ciclo de vida para trasladarlos a Amazon S3 Glacier despues de 60 dias"}');
INSERT INTO public."Question" VALUES ('cmo7juaqf000cth0pne1vi0rk', 'Una empresa de tecnologia ha desplegado multiples instancias de EC2 dentro de un grupo de Auto Scaling para soportar una platafora de de analisis de datos en tiempo real. Para mejorar la observabilidad, quieren monitorear sus instancias de EC2 con metricas detallas de CloudWatch. Sin embargo, descubren que una de las metricas que necesitan no esta disponible de manera predeterminada. ¿Cual de las siguientes metricas deben configurar de manera manual en CloudWatch?', '{"Tasa de operaciones de lectura en disco de una instancia EC2","Porcentaje de utilizacion de CPU de una instancia EC2","Porcentaje de utilizacion de memoria de una instancia EC2","Cantidad de paquetes enviados desde una instancia EC2"}', NULL, 'cmo7g91fm0000th0p4p9lc3ls', '2026-04-20 18:49:35.703', '{"Porcentaje de utilizacion de memoria de una instancia EC2"}');


--
-- TOC entry 3423 (class 0 OID 16389)
-- Dependencies: 214
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public._prisma_migrations VALUES ('9b0ae4b8-985f-43bd-8839-24f4a0ad57e3', '877a8af07fb0f7b1b7bf2f58f5a81f667f4807449e521a509abbbcad14e60ace', '2026-01-18 06:26:05.16072+00', '20260117233100_init_study_bank', NULL, NULL, '2026-01-18 06:26:04.624543+00', 1);
INSERT INTO public._prisma_migrations VALUES ('cf99641e-4d45-4a06-9a01-f94a4b15b9b3', '47412732627e4a0862f0c47a82114eeed03dd9d831e3043b9ee32fe62205da9d', '2026-01-18 06:26:05.860176+00', '20260118041658_add_multiselect', NULL, NULL, '2026-01-18 06:26:05.344503+00', 1);


--
-- TOC entry 3277 (class 2606 OID 16405)
-- Name: Bank Bank_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Bank"
    ADD CONSTRAINT "Bank_pkey" PRIMARY KEY (id);


--
-- TOC entry 3279 (class 2606 OID 16413)
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);


--
-- TOC entry 3275 (class 2606 OID 16397)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3280 (class 2606 OID 16414)
-- Name: Question Question_bankId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES public."Bank"(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-04-29 20:58:51 CST

--
-- PostgreSQL database dump complete
--

\unrestrict BQioBgsGGliTi6gZFbs9K7JIQKq8l9qXN6g2r5FnvGaXX43fC5obtwmioQxuKqw

