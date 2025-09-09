--
-- PostgreSQL database dump
--

\restrict 7Afld510AJrDQrJeTcGNGNr7IiOaYj99WJgk6obvZHCKPeA182MGAjHp7nkvTu5

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_evses_status; Type: TYPE; Schema: public; Owner: cpo_user
--

CREATE TYPE public.enum_evses_status AS ENUM (
    'AVAILABLE',
    'BLOCKED',
    'CHARGING',
    'INOPERATIVE',
    'OUTOFORDER',
    'PLANNED',
    'REMOVED',
    'RESERVED',
    'UNKNOWN'
);


ALTER TYPE public.enum_evses_status OWNER TO cpo_user;

--
-- Name: enum_locations_parking_type; Type: TYPE; Schema: public; Owner: cpo_user
--

CREATE TYPE public.enum_locations_parking_type AS ENUM (
    'ALONG_MOTORWAY',
    'PARKING_GARAGE',
    'ON_DRIVEWAY',
    'ON_STREET',
    'UNDERGROUND_GARAGE'
);


ALTER TYPE public.enum_locations_parking_type OWNER TO cpo_user;

--
-- Name: enum_sessions_status; Type: TYPE; Schema: public; Owner: cpo_user
--

CREATE TYPE public.enum_sessions_status AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'INVALID',
    'PENDING',
    'RESERVATION'
);


ALTER TYPE public.enum_sessions_status OWNER TO cpo_user;

--
-- Name: enum_tariffs_type; Type: TYPE; Schema: public; Owner: cpo_user
--

CREATE TYPE public.enum_tariffs_type AS ENUM (
    'AD_HOC_PAYMENT',
    'PROFILE_CHEAP',
    'PROFILE_FAST',
    'PROFILE_GREEN',
    'REGULAR'
);


ALTER TYPE public.enum_tariffs_type OWNER TO cpo_user;

--
-- Name: enum_tokens_default_profile_type; Type: TYPE; Schema: public; Owner: cpo_user
--

CREATE TYPE public.enum_tokens_default_profile_type AS ENUM (
    'CHEAP',
    'FAST',
    'GREEN',
    'REGULAR'
);


ALTER TYPE public.enum_tokens_default_profile_type OWNER TO cpo_user;

--
-- Name: enum_tokens_type; Type: TYPE; Schema: public; Owner: cpo_user
--

CREATE TYPE public.enum_tokens_type AS ENUM (
    'AD_HOC_USER',
    'APP_USER',
    'OTHER',
    'RFID'
);


ALTER TYPE public.enum_tokens_type OWNER TO cpo_user;

--
-- Name: enum_tokens_whitelist; Type: TYPE; Schema: public; Owner: cpo_user
--

CREATE TYPE public.enum_tokens_whitelist AS ENUM (
    'ALWAYS',
    'ALLOWED',
    'ALLOWED_OFFLINE',
    'NEVER'
);


ALTER TYPE public.enum_tokens_whitelist OWNER TO cpo_user;

--
-- Name: evse_status_enum; Type: TYPE; Schema: public; Owner: cpo_user
--

CREATE TYPE public.evse_status_enum AS ENUM (
    'AVAILABLE',
    'BLOCKED',
    'CHARGING',
    'INOPERATIVE',
    'MAINTENANCE',
    'RESERVED',
    'UNKNOWN'
);


ALTER TYPE public.evse_status_enum OWNER TO cpo_user;

--
-- Name: session_status_enum; Type: TYPE; Schema: public; Owner: cpo_user
--

CREATE TYPE public.session_status_enum AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'INVALID',
    'PENDING',
    'RESERVATION'
);


ALTER TYPE public.session_status_enum OWNER TO cpo_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cdrs; Type: TABLE; Schema: public; Owner: cpo_user
--

CREATE TABLE public.cdrs (
    id character varying(36) NOT NULL,
    country_code character varying(2) NOT NULL,
    party_id character varying(10) NOT NULL,
    session_id character varying(36) NOT NULL,
    evse_uid character varying(36) NOT NULL,
    connector_id character varying(36),
    id_token character varying(36) NOT NULL,
    start_datetime timestamp with time zone NOT NULL,
    end_datetime timestamp with time zone NOT NULL,
    total_energy numeric(10,2) NOT NULL,
    total_cost numeric(10,2),
    currency character varying(3),
    total_parking_time integer,
    total_time integer NOT NULL,
    last_updated timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cdrs OWNER TO cpo_user;

--
-- Name: credentials; Type: TABLE; Schema: public; Owner: cpo_user
--

CREATE TABLE public.credentials (
    id character varying(36) NOT NULL,
    token character varying(255) NOT NULL,
    url character varying(255) NOT NULL,
    business_details json,
    party_id character varying(10) NOT NULL,
    country_code character varying(2) NOT NULL,
    last_updated timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.credentials OWNER TO cpo_user;

--
-- Name: emsp_cdrs; Type: TABLE; Schema: public; Owner: cpo_user
--

CREATE TABLE public.emsp_cdrs (
    id character varying(36) NOT NULL,
    emsp_party_id character varying(10) NOT NULL,
    emsp_country_code character varying(2) NOT NULL,
    cdr_id character varying(36) NOT NULL,
    session_id character varying(36) NOT NULL,
    evse_uid character varying(36) NOT NULL,
    connector_id character varying(36),
    id_token character varying(36) NOT NULL,
    start_datetime timestamp with time zone NOT NULL,
    end_datetime timestamp with time zone NOT NULL,
    total_energy numeric(10,2) NOT NULL,
    total_cost numeric(10,2),
    currency character varying(3),
    total_parking_time integer,
    total_time integer NOT NULL,
    last_updated timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.emsp_cdrs OWNER TO cpo_user;

--
-- Name: emsp_contracts; Type: TABLE; Schema: public; Owner: cpo_user
--

CREATE TABLE public.emsp_contracts (
    id character varying(36) NOT NULL,
    emsp_party_id character varying(10) NOT NULL,
    emsp_country_code character varying(2) NOT NULL,
    contract_id character varying(36) NOT NULL,
    party_id character varying(10) NOT NULL,
    country_code character varying(2) NOT NULL,
    contract_type character varying(50) NOT NULL,
    contract_status character varying(50) NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    terms json,
    pricing json,
    last_updated timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.emsp_contracts OWNER TO cpo_user;

--
-- Name: emsp_evses; Type: TABLE; Schema: public; Owner: cpo_user
--

CREATE TABLE public.emsp_evses (
    id character varying(36) NOT NULL,
    emsp_party_id character varying(10) NOT NULL,
    emsp_country_code character varying(2) NOT NULL,
    location_id character varying(36) NOT NULL,
    evse_id character varying(48) NOT NULL,
    status character varying(50) NOT NULL,
    capabilities json,
    connectors json NOT NULL,
    floor_level character varying(4),
    coordinates json,
    physical_reference character varying(16),
    directions json,
    parking_restrictions json,
    group_id character varying(36),
    last_updated timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.emsp_evses OWNER TO cpo_user;

--
-- Name: emsp_locations; Type: TABLE; Schema: public; Owner: cpo_user
--

CREATE TABLE public.emsp_locations (
    id character varying(36) NOT NULL,
    emsp_party_id character varying(10) NOT NULL,
    emsp_country_code character varying(2) NOT NULL,
    location_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    city character varying(100) NOT NULL,
    postal_code character varying(10),
    state character varying(100),
    country character varying(100) NOT NULL,
    coordinates jsonb NOT NULL,
    related_locations json,
    parking_type character varying(50),
    evse_list json,
    directions character varying(500),
    operator json,
    suboperator json,
    owner json,
    facilities json,
    time_zone character varying(255) NOT NULL,
    opening_times json,
    charging_when_closed boolean,
    images json,
    energy_mix json,
    last_updated timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.emsp_locations OWNER TO cpo_user;

--
-- Name: emsp_sessions; Type: TABLE; Schema: public; Owner: cpo_user
--

CREATE TABLE public.emsp_sessions (
    id character varying(36) NOT NULL,
    emsp_party_id character varying(10) NOT NULL,
    emsp_country_code character varying(2) NOT NULL,
    session_id character varying(36) NOT NULL,
    evse_uid character varying(36) NOT NULL,
    connector_id character varying(36),
    id_token character varying(36) NOT NULL,
    start_datetime timestamp with time zone NOT NULL,
    end_datetime timestamp with time zone,
    total_cost numeric(10,2),
    status character varying(50) NOT NULL,
    last_updated timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    country_code character varying(2),
    party_id character varying(3),
    start_date_time timestamp with time zone,
    end_date_time timestamp with time zone,
    kwh numeric(10,3) DEFAULT 0.0,
    cdr_token jsonb,
    auth_method character varying(50),
    location_id uuid,
    currency character varying(3) DEFAULT 'EUR'::character varying,
    charging_periods jsonb
);


ALTER TABLE public.emsp_sessions OWNER TO cpo_user;

--
-- Name: TABLE emsp_sessions; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON TABLE public.emsp_sessions IS 'Sesiones de carga recibidas de CPOs externos';


--
-- Name: COLUMN emsp_sessions.session_id; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.emsp_sessions.session_id IS 'ID único de la sesión';


--
-- Name: COLUMN emsp_sessions.evse_uid; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.emsp_sessions.evse_uid IS 'UID del EVSE';


--
-- Name: COLUMN emsp_sessions.connector_id; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.emsp_sessions.connector_id IS 'ID del conector';


--
-- Name: COLUMN emsp_sessions.total_cost; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.emsp_sessions.total_cost IS 'Costo total de la sesión (JSON)';


--
-- Name: COLUMN emsp_sessions.status; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.emsp_sessions.status IS 'Estado de la sesión (PENDING, ACTIVE, COMPLETED, etc.)';


--
-- Name: COLUMN emsp_sessions.country_code; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.emsp_sessions.country_code IS 'Código de país (2 caracteres)';


--
-- Name: COLUMN emsp_sessions.party_id; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.emsp_sessions.party_id IS 'ID del operador (3 caracteres)';


--
-- Name: COLUMN emsp_sessions.start_date_time; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.emsp_sessions.start_date_time IS 'Fecha y hora de inicio de la sesión';


--
-- Name: COLUMN emsp_sessions.end_date_time; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.emsp_sessions.end_date_time IS 'Fecha y hora de fin de la sesión';


--
-- Name: COLUMN emsp_sessions.kwh; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.emsp_sessions.kwh IS 'Energía consumida en kWh';


--
-- Name: COLUMN emsp_sessions.cdr_token; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.emsp_sessions.cdr_token IS 'Token utilizado para la sesión (JSON)';


--
-- Name: COLUMN emsp_sessions.auth_method; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.emsp_sessions.auth_method IS 'Método de autenticación utilizado';


--
-- Name: COLUMN emsp_sessions.location_id; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.emsp_sessions.location_id IS 'ID de la ubicación';


--
-- Name: COLUMN emsp_sessions.currency; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.emsp_sessions.currency IS 'Moneda utilizada';


--
-- Name: COLUMN emsp_sessions.charging_periods; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.emsp_sessions.charging_periods IS 'Períodos de carga (JSON)';


--
-- Name: emsp_tariffs; Type: TABLE; Schema: public; Owner: cpo_user
--

CREATE TABLE public.emsp_tariffs (
    id character varying(36) NOT NULL,
    emsp_party_id character varying(10) NOT NULL,
    emsp_country_code character varying(2) NOT NULL,
    tariff_id character varying(36) NOT NULL,
    currency character varying(3) NOT NULL,
    type character varying(50) NOT NULL,
    elements json NOT NULL,
    start_date_time timestamp with time zone,
    end_date_time timestamp with time zone,
    last_updated timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.emsp_tariffs OWNER TO cpo_user;

--
-- Name: emsp_tokens; Type: TABLE; Schema: public; Owner: cpo_user
--

CREATE TABLE public.emsp_tokens (
    id character varying(36) NOT NULL,
    emsp_party_id character varying(10) NOT NULL,
    emsp_country_code character varying(2) NOT NULL,
    token_uid character varying(36) NOT NULL,
    type character varying(50) NOT NULL,
    contract_id character varying(36),
    visual_number character varying(255),
    issuer character varying(100) NOT NULL,
    group_id character varying(36),
    valid boolean NOT NULL,
    whitelist character varying(50),
    language character varying(10),
    default_profile_type character varying(50),
    energy_contract json,
    last_updated timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.emsp_tokens OWNER TO cpo_user;

--
-- Name: evses; Type: TABLE; Schema: public; Owner: cpo_user
--

CREATE TABLE public.evses (
    id character varying(36) NOT NULL,
    location_id character varying(36) NOT NULL,
    country_code character varying(2) NOT NULL,
    party_id character varying(10) NOT NULL,
    evse_id character varying(48) NOT NULL,
    status character varying(50) NOT NULL,
    capabilities json,
    connectors json NOT NULL,
    floor_level character varying(4),
    coordinates json,
    physical_reference character varying(50),
    directions json,
    parking_restrictions json,
    group_id character varying(36),
    last_updated timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.evses OWNER TO cpo_user;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: cpo_user
--

CREATE TABLE public.locations (
    id character varying(36) NOT NULL,
    country_code character varying(2) NOT NULL,
    party_id character varying(10) NOT NULL,
    name character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    city character varying(100) NOT NULL,
    postal_code character varying(10),
    state character varying(100),
    country character varying(3) NOT NULL,
    coordinates jsonb NOT NULL,
    related_locations json,
    parking_type character varying(50),
    evses json,
    directions json,
    operator json,
    suboperator json,
    owner json,
    facilities json,
    time_zone character varying(255) NOT NULL,
    opening_times json,
    charging_when_closed boolean,
    images json,
    energy_mix json,
    last_updated timestamp with time zone NOT NULL,
    publish boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.locations OWNER TO cpo_user;

--
-- Name: ocpi_tokens; Type: TABLE; Schema: public; Owner: cpo_user
--

CREATE TABLE public.ocpi_tokens (
    id character varying(36) NOT NULL,
    token character varying(64) NOT NULL,
    party_id character varying(10) NOT NULL,
    country_code character varying(2) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_used_at timestamp without time zone,
    metadata json,
    created_at_sequelize timestamp without time zone,
    updated_at_sequelize timestamp without time zone
);


ALTER TABLE public.ocpi_tokens OWNER TO cpo_user;

--
-- Name: TABLE ocpi_tokens; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON TABLE public.ocpi_tokens IS 'Tabla para almacenar tokens OCPI generados para cada party_id';


--
-- Name: COLUMN ocpi_tokens.id; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.ocpi_tokens.id IS 'Identificador único del registro de token';


--
-- Name: COLUMN ocpi_tokens.token; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.ocpi_tokens.token IS 'Token OCPI de autenticación (máximo 64 caracteres)';


--
-- Name: COLUMN ocpi_tokens.party_id; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.ocpi_tokens.party_id IS 'Party ID asociado a este token';


--
-- Name: COLUMN ocpi_tokens.country_code; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.ocpi_tokens.country_code IS 'Código de país ISO 3166-1 alpha-2';


--
-- Name: COLUMN ocpi_tokens.is_active; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.ocpi_tokens.is_active IS 'Indica si el token está activo';


--
-- Name: COLUMN ocpi_tokens.expires_at; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.ocpi_tokens.expires_at IS 'Fecha de expiración del token (opcional)';


--
-- Name: COLUMN ocpi_tokens.created_at; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.ocpi_tokens.created_at IS 'Fecha de creación del token';


--
-- Name: COLUMN ocpi_tokens.last_used_at; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.ocpi_tokens.last_used_at IS 'Última vez que se usó el token';


--
-- Name: COLUMN ocpi_tokens.metadata; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.ocpi_tokens.metadata IS 'Metadatos adicionales del token en formato JSON';


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: cpo_user
--

CREATE TABLE public.sessions (
    id character varying(36) NOT NULL,
    country_code character varying(2) NOT NULL,
    party_id character varying(10) NOT NULL,
    evse_uid character varying(36) NOT NULL,
    connector_id character varying(36),
    id_token character varying(36) NOT NULL,
    start_datetime timestamp with time zone NOT NULL,
    end_datetime timestamp with time zone,
    total_cost numeric(10,2),
    status public.session_status_enum NOT NULL,
    last_updated timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    kwh numeric(10,3) DEFAULT 0.0,
    CONSTRAINT chk_sessions_status CHECK ((status = ANY (ARRAY['ACTIVE'::public.session_status_enum, 'COMPLETED'::public.session_status_enum, 'INVALID'::public.session_status_enum, 'PENDING'::public.session_status_enum])))
);


ALTER TABLE public.sessions OWNER TO cpo_user;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON TABLE public.sessions IS 'OCPI 2.2 Sessions table to track charging sessions';


--
-- Name: COLUMN sessions.evse_uid; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.sessions.evse_uid IS 'Reference to the EVSE where the session is taking place';


--
-- Name: COLUMN sessions.status; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.sessions.status IS 'Current status of the session: ACTIVE, COMPLETED, INVALID, PENDING';


--
-- Name: COLUMN sessions.kwh; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.sessions.kwh IS 'Energy consumed in kWh';


--
-- Name: tariffs; Type: TABLE; Schema: public; Owner: cpo_user
--

CREATE TABLE public.tariffs (
    id character varying(36) NOT NULL,
    country_code character varying(2) NOT NULL,
    party_id character varying(10) NOT NULL,
    currency character varying(3) NOT NULL,
    type character varying(50) NOT NULL,
    elements json NOT NULL,
    last_updated timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    start_date_time timestamp with time zone,
    end_date_time timestamp with time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.tariffs OWNER TO cpo_user;

--
-- Name: tokens; Type: TABLE; Schema: public; Owner: cpo_user
--

CREATE TABLE public.tokens (
    id character varying(36) NOT NULL,
    country_code character varying(2) NOT NULL,
    party_id character varying(10) NOT NULL,
    uid character varying(36) NOT NULL,
    type character varying(50) NOT NULL,
    auth_method character varying(50) NOT NULL,
    issuer character varying(255),
    valid boolean DEFAULT true NOT NULL,
    whitelist character varying(50),
    last_updated timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    visual_number character varying(255),
    group_id character varying(36),
    language character varying(10),
    default_profile_type character varying(50),
    energy_contract json,
    contract_id character varying(36)
);


ALTER TABLE public.tokens OWNER TO cpo_user;

--
-- Name: TABLE tokens; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON TABLE public.tokens IS 'Tabla que almacena tokens de usuarios eMSP cuando la aplicación actúa como eMSP';


--
-- Name: COLUMN tokens.type; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.tokens.type IS 'Tipo de token según OCPI 2.2: AD_HOC_USER, APP_USER, OTHER, RFID';


--
-- Name: COLUMN tokens.whitelist; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.tokens.whitelist IS 'Tipo de whitelist: ALWAYS, ALLOWED, ALLOWED_OFFLINE, NEVER';


--
-- Name: COLUMN tokens.default_profile_type; Type: COMMENT; Schema: public; Owner: cpo_user
--

COMMENT ON COLUMN public.tokens.default_profile_type IS 'Perfil por defecto: CHEAP, FAST, GREEN, REGULAR';


--
-- Data for Name: cdrs; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.cdrs (id, country_code, party_id, session_id, evse_uid, connector_id, id_token, start_datetime, end_datetime, total_energy, total_cost, currency, total_parking_time, total_time, last_updated, created_at, updated_at) FROM stdin;
959c66c3-4a0a-4a4d-aedc-8efada2050c1	ES	EFI	bb9d2a41-40e3-4707-9468-580db522deb5	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 06:04:03.067+00	2025-09-04 06:04:23.408+00	0.00	0.00	EUR	0	20	2025-09-04 06:04:23.408+00	2025-09-04 06:04:03.067+00	2025-09-04 06:04:23.423+00
bf2ecce9-78e9-465e-b10a-5a3dc3593a53	ES	EFI	9e20c3c6-c0df-4de5-a5af-77e54774a573	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 06:23:54.011+00	2025-09-04 06:24:10.342+00	0.00	0.00	EUR	0	16	2025-09-04 06:24:10.342+00	2025-09-04 06:23:54.012+00	2025-09-04 06:24:10.357+00
161e16db-5777-4ebb-b6a8-d2b7c6362d00	ES	EFI	0d7f93e1-c918-4f88-a289-f8df7bcef83b	e7afc0a1-3774-42b9-be6b-1ebf773c9cb6	927214cc-f311-4d9f-985d-90a0a98b947e	MOCK_TEST_KEY	2025-09-04 06:38:45.3+00	2025-09-04 06:41:11.363+00	0.00	0.00	EUR	0	146	2025-09-04 06:41:11.363+00	2025-09-04 06:38:45.301+00	2025-09-04 06:41:11.381+00
4b24e127-7106-4567-b353-daed5ccbd2c8	ES	EFI	35c3d2eb-4591-4657-814e-849f1e7f3ba4	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 06:27:39.963+00	2025-09-04 06:41:13.596+00	0.00	0.00	EUR	0	813	2025-09-04 06:41:13.596+00	2025-09-04 06:27:39.964+00	2025-09-04 06:41:13.61+00
bf2b4006-69a8-4318-b86e-247de160636b	ES	EFI	81c3dfd7-9e8b-4e84-80f7-3758c5612bcc	e7afc0a1-3774-42b9-be6b-1ebf773c9cb6	927214cc-f311-4d9f-985d-90a0a98b947e	MOCK_TEST_KEY	2025-09-04 06:48:18.929+00	2025-09-04 06:48:42.765+00	0.00	0.00	EUR	0	23	2025-09-04 06:48:42.765+00	2025-09-04 06:48:18.93+00	2025-09-04 06:48:42.774+00
fd68b358-4b73-4fc3-a541-b823413e7a96	ES	EFI	edeb6f4b-c139-417b-a9c2-12c06fa3dd65	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 06:50:36.586+00	2025-09-04 06:51:35.739+00	0.00	0.00	EUR	0	59	2025-09-04 06:51:35.739+00	2025-09-04 06:50:36.586+00	2025-09-04 06:51:35.753+00
473db003-2784-4086-9033-f256c685d4aa	ES	EFI	2503b7d7-5838-4a6f-aa67-e89af30ce2f0	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 06:55:04.715+00	2025-09-04 07:16:10.797+00	0.00	0.00	EUR	0	1266	2025-09-04 07:16:10.797+00	2025-09-04 06:55:04.715+00	2025-09-04 07:16:10.814+00
8d62f1a5-fd5b-4a01-a5b7-1571471b422b	ES	EFI	d72b95cc-8236-49b4-9c71-5a9a91b047d9	e7afc0a1-3774-42b9-be6b-1ebf773c9cb6	927214cc-f311-4d9f-985d-90a0a98b947e	MOCK_TEST_KEY	2025-09-04 06:54:29.28+00	2025-09-04 07:16:12.788+00	0.00	0.00	EUR	0	1303	2025-09-04 07:16:12.788+00	2025-09-04 06:54:29.28+00	2025-09-04 07:16:12.801+00
366b2327-4c30-4c32-b0bf-58a364caf2ef	ES	EFI	d9f52502-2d0d-4912-a7af-7ecb00a5d3d6	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 08:40:45.25+00	2025-09-04 08:43:45.764+00	0.00	0.00	EUR	0	180	2025-09-04 08:43:45.764+00	2025-09-04 08:40:45.25+00	2025-09-04 08:43:45.777+00
c4ca69ff-8179-43c1-b160-36005782655c	ES	EFI	e703ed53-d6c6-45a3-969f-e15e88bd5cb9	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 12:30:21.629+00	2025-09-04 12:32:16.972+00	0.00	0.00	EUR	0	115	2025-09-04 12:32:16.972+00	2025-09-04 12:30:21.63+00	2025-09-04 12:32:16.986+00
ff65d241-b246-4e7e-8ac7-3ced9d1f5405	ES	EFI	a36f0dcd-dcb7-42e7-a435-1b03cfc3bc11	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 14:24:42.519+00	2025-09-04 14:25:36.688+00	0.00	0.00	EUR	0	54	2025-09-04 14:25:36.688+00	2025-09-04 14:24:42.52+00	2025-09-04 14:25:36.693+00
e216b580-521e-4742-a698-52d8b41645c1	ES	EFI	57444ccd-e79a-47a5-8033-34b250525088	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 14:32:56.322+00	2025-09-04 14:33:45.901+00	0.00	0.00	EUR	0	49	2025-09-04 14:33:45.901+00	2025-09-04 14:32:56.323+00	2025-09-04 14:33:45.912+00
60e79a3a-4b2f-480d-b1a3-8cbcee94260c	ES	EFI	04133231-cef5-46ef-b8e4-e8abb42dc22b	3f99cf10-4592-4d48-825d-c70d4e59e44b	b9588185-43ad-4a57-a14c-71e118c129c2	MOCK_TEST_KEY	2025-09-05 07:36:51.647+00	2025-09-05 07:41:51.596+00	0.00	0.00	EUR	0	299	2025-09-05 07:41:51.596+00	2025-09-05 07:36:51.649+00	2025-09-05 07:41:51.61+00
\.


--
-- Data for Name: credentials; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.credentials (id, token, url, business_details, party_id, country_code, last_updated, created_at, updated_at) FROM stdin;
emsp-test-001	test-token-123	https://emsp-test.example.com	{"name":"EMSP de Prueba"}	EMSP001	ES	2025-09-01 16:01:43.389701+00	2025-09-01 16:01:43.389701+00	2025-09-01 16:01:43.389701+00
dd9d555e-2bd5-40b4-b09a-3145d3050feb	YzY1ZWMxNTZmZjJmY2NiMDMxYWQxZDY1YjFlN2VkMWM1YzVkNzVmZmQ5OGZiZGIw	https://ocpi-api.pre.efimob.net	{"logo":{"url":"https://static.evolve.telpark.com/images/iop/telpark_logo.png","type":"png","category":"OPERATOR","thumbnail":"https://static.evolve.telpark.com/images/iop/telpark_logo.png"},"name":"TELPARK","website":"https://www.telpark.com/es/"}	EPK	ES	2025-08-28 07:17:50.704+00	2025-08-27 09:03:01.55+00	2025-08-28 07:17:50.706+00
\.


--
-- Data for Name: emsp_cdrs; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.emsp_cdrs (id, emsp_party_id, emsp_country_code, cdr_id, session_id, evse_uid, connector_id, id_token, start_datetime, end_datetime, total_energy, total_cost, currency, total_parking_time, total_time, last_updated, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: emsp_contracts; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.emsp_contracts (id, emsp_party_id, emsp_country_code, contract_id, party_id, country_code, contract_type, contract_status, start_date, end_date, terms, pricing, last_updated, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: emsp_evses; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.emsp_evses (id, emsp_party_id, emsp_country_code, location_id, evse_id, status, capabilities, connectors, floor_level, coordinates, physical_reference, directions, parking_restrictions, group_id, last_updated, created_at, updated_at) FROM stdin;
966d3e7d-3cd0-48cc-a8b2-bfe0749a8058	EFI	ES	018f5c4e-8c7c-7358-83b2-cb03ea105590	ES*EPK*ECPSIMEMPARK010*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:02.309Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.309+00	2025-08-29 10:09:51.193958+00	2025-09-05 07:45:46.491501+00
2bcd2937-a3bd-4ad8-9661-7e2afa1aa0e9	EFI	ES	018f5c4e-8c7c-7358-83b2-cb03ea105590	ES*EPK*ECPSIMEMPARK010*2	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"2","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:02.309Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.309+00	2025-08-29 10:09:51.197434+00	2025-09-05 07:45:46.499258+00
708079bb-d739-4734-9d19-b59440436bb1	EFI	ES	0197abf8-9917-7f08-899c-f18eea04e72b	ES*EPK*ECPSIMEMPARK036*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":220,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:02.571Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.571+00	2025-08-29 10:09:51.206464+00	2025-09-05 07:45:46.514775+00
0042e5d9-a7be-4a42-9875-e879b82336af	EFI	ES	0197abf8-9917-7f08-899c-f18eea04e72b	ES*EPK*ECPSIMEMPARK037*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":16,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:02.571Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.571+00	2025-08-29 10:09:51.203653+00	2025-09-05 07:45:46.521394+00
4dc87a54-ff50-41b8-994e-7449eed3839d	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*ESAC0016*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.861+00	2025-08-29 10:09:51.219811+00	2025-09-05 07:45:46.534104+00
95aed594-98b9-4259-9258-d8186fb91637	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*ESAC0012*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.861+00	2025-08-29 10:09:51.2158+00	2025-09-05 07:45:46.5375+00
db1538c4-30a0-4850-a450-3fd674f76988	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*ESAC0011*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.860Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.86+00	2025-08-29 10:09:51.213079+00	2025-09-05 07:45:46.54098+00
dd4026a2-577e-4652-9b10-509ba4e71890	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*ESAC0019*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.860Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.86+00	2025-08-29 10:09:51.222432+00	2025-09-05 07:45:46.544594+00
4438b306-5bbd-4b09-9995-32d29a7d73e1	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*ESAC0018*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.861+00	2025-08-29 10:09:51.224798+00	2025-09-05 07:45:46.548612+00
18a2eb5d-8415-4ac1-932e-73b64ef98d4f	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*ESAC0007*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.861+00	2025-08-29 10:09:51.226854+00	2025-09-05 07:45:46.552876+00
b8dfbf46-afa3-45e8-877e-3ec40e82ce53	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*ESAC0008*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.861+00	2025-08-29 10:09:51.229366+00	2025-09-05 07:45:46.561637+00
0ec58c98-25bf-4f11-895e-7d7ee8ec9141	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*ESAC0006*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.861+00	2025-08-29 10:09:51.231424+00	2025-09-05 07:45:46.566698+00
450761cc-a1e5-4a19-aa9e-642d7711fa1b	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*ESAC0014*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.860Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.86+00	2025-08-29 10:09:51.233752+00	2025-09-05 07:45:46.57141+00
7b087cd9-f92c-4493-85b7-6269276a42b8	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*ESAC0005*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.860Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.86+00	2025-08-29 10:09:51.235792+00	2025-09-05 07:45:46.576681+00
a7b6b84c-6845-4c79-9e21-4f24e3d17fa1	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*ESAC0010*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.861+00	2025-08-29 10:09:51.237725+00	2025-09-05 07:45:46.581717+00
5874b64b-fe2e-4be2-966b-e4fb10c1f043	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*EEVCC02144*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:02.860Z"}]	\N	\N	4207	\N	\N	\N	2025-08-21 10:03:02.86+00	2025-08-29 10:09:51.255294+00	2025-09-05 07:45:46.612872+00
870a3fc5-f2d3-4671-b9e2-ca25a7cccd4e	EFI	ES	018ee163-16fe-71b4-af50-87fe667c39dc	ES*EPK*ECPSIMEMPARK008*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-02-21T12:42:20.512Z"}]	\N	\N	9008	\N	\N	\N	2025-02-21 12:42:20.512+00	2025-08-29 10:09:51.178838+00	2025-09-05 07:45:46.472496+00
ed741323-0fc2-46ee-b54e-94b6955ef017	EFI	ES	018ee163-16fe-71b4-af50-87fe667c39dc	ES*EPK*ECPSIMEMPARK009*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-02-21T12:46:23.395Z"}]	\N	\N	EPK009*1	\N	\N	\N	2025-02-21 12:46:23.395+00	2025-08-29 10:09:51.18644+00	2025-09-05 07:45:46.478431+00
d16e666b-d069-4c57-8425-49a017874d09	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*ESAC0017*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.861+00	2025-08-29 10:09:51.248816+00	2025-09-05 07:45:46.602464+00
c512a9a2-8c95-4c7f-94ce-cc4e941ce9b6	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*EEVCC02145*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:02.861Z"}]	\N	\N	4208	\N	\N	\N	2025-08-21 10:03:02.861+00	2025-08-29 10:09:51.25073+00	2025-09-05 07:45:46.606333+00
cae0ddad-7324-4eb8-b422-6b39197bd623	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*EEVCC02143*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:02.860Z"}]	\N	\N	4206	\N	\N	\N	2025-08-21 10:03:02.86+00	2025-08-29 10:09:51.252671+00	2025-09-05 07:45:46.609998+00
393a97c4-1eb8-4db6-a20b-a1daef74c679	EFI	ES	019831fa-6620-78e2-b936-d6a4db4c0eeb	ES*EPK*EEVCC00019999999*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":30,"tariff_ids":["0fd1155a-e00f-4e60-906d-9fafe3c7ab10"],"last_updated":"2025-08-21T10:03:39.656Z"}]	\N	\N	5672	\N	\N	\N	2025-08-21 10:03:39.656+00	2025-08-29 10:09:51.259338+00	2025-09-05 07:45:46.620879+00
6af9fa56-5a49-41f9-bfd1-2dc8d5845927	EFI	ES	018fc9cb-9fe6-752c-a7f9-db9684c55e90	ES*EPK*EEVCC01832*1	OUTOFORDER	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":220,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-22T06:06:24.779Z"}]	\N	\N	0001	\N	\N	\N	2025-08-22 06:06:24.779+00	2025-08-29 10:09:51.264181+00	2025-09-05 07:45:46.629668+00
0e188c59-79f3-4e51-b9d2-c8164f05748c	EFI	ES	0191e1d9-3f25-70ae-a838-c31ec5cbd6d9	ES*EPK*ECPSIMEMPARK025*1	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["2126c824-39d6-424d-8e61-3ebd402f5d4a"],"last_updated":"2025-09-03T15:13:49.729Z"}]	\N	\N	9025	\N	\N	\N	2025-09-03 15:13:49.729+00	2025-08-29 10:09:51.269381+00	2025-09-05 07:45:46.635796+00
3e136d03-05bf-468f-a4ae-ac34a874f0d5	EFI	ES	0191e1d9-3f25-70ae-a838-c31ec5cbd6d9	ES*EPK*ECPSIMEMPARK031*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-03-25T17:57:24.403Z"}]	\N	\N	CPSIM_EMPARK_031	\N	\N	\N	2025-03-25 17:57:24.403+00	2025-08-29 10:09:51.27182+00	2025-09-05 07:45:46.641161+00
3f5f7365-fca8-40ce-9691-6ab39cb7c907	EFI	ES	0197ac5a-b3ac-7551-909f-b44b5d416107	ES*EPK*ECPSIMEMPARK040*1	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":16,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-03T15:13:49.486Z"}]	\N	\N	CPSIM_EMPARK_040	\N	\N	\N	2025-09-03 15:13:49.486+00	2025-08-29 10:09:51.288621+00	2025-09-05 07:45:46.655306+00
806c6e43-89e1-49a9-8284-9397a8ad920f	EFI	ES	0197ac5a-b3ac-7551-909f-b44b5d416107	ES*EPK*ECPSIMEMPARK038*1	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":220,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-03T15:13:50.673Z"}]	\N	\N	CPSIM_EMPARK_038	\N	\N	\N	2025-09-03 15:13:50.673+00	2025-08-29 10:09:51.2827+00	2025-09-05 07:45:46.6589+00
06d83c87-919f-41c1-8d84-727b414c8653	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*ESAC0015*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.861+00	2025-08-29 10:09:51.246762+00	2025-09-05 07:45:46.598454+00
c447336d-3e5d-42b0-8405-8655d6a2b910	EFI	ES	0197ac5a-b3ac-7551-909f-b44b5d416107	ES*EPK*ECPSIMEMPARK039*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":16,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:02.688Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.688+00	2025-08-29 10:09:51.285655+00	2025-09-05 07:45:46.649956+00
95b81e45-3399-46c8-9828-2a38beac27d5	EFI	ES	01905959-e67e-73be-83c3-5526e5e5bba3	ES*EPK*ECPSIMEMPARK017*1	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["0fd1155a-e00f-4e60-906d-9fafe3c7ab10"],"last_updated":"2025-09-03T15:13:50.658Z"}]	\N	\N	CPSIM_EMPARK_017	\N	\N	\N	2025-09-03 15:13:50.658+00	2025-08-29 10:09:51.326296+00	2025-09-05 07:45:46.666741+00
b6ac733f-d391-40ee-88e6-4ab25351435e	EFI	ES	01905a14-4179-7068-9db4-0456abf9dfb4	ES*EPK*ECPSIMEMPARK020*1	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["0fd1155a-e00f-4e60-906d-9fafe3c7ab10"],"last_updated":"2025-09-03T15:14:49.920Z"}]	\N	\N	CPSIM_EMPARK_020	\N	\N	\N	2025-09-03 15:14:49.92+00	2025-08-29 10:09:51.276817+00	2025-09-05 07:45:46.681894+00
b8855bc2-3019-4370-9399-4310c2bd573b	EFI	ES	01946e8d-0656-7d2c-b055-d0faf4340f94	ES*EPK*EWENEA001*1	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["0fd1155a-e00f-4e60-906d-9fafe3c7ab10"],"last_updated":"2025-09-03T15:16:09.413Z"}]	\N	\N	WENEA_001	\N	\N	\N	2025-09-03 15:16:09.413+00	2025-08-29 10:09:51.297625+00	2025-09-05 07:45:46.692192+00
690a36a7-52ac-4058-b1a8-646f248ea45c	EFI	ES	01946e8d-0656-7d2c-b055-d0faf4340f94	ES*EPK*EEVCC0001*1	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["0fd1155a-e00f-4e60-906d-9fafe3c7ab10"],"last_updated":"2025-09-03T15:14:49.894Z"}]	\N	\N	alf-EV000000001	\N	\N	\N	2025-09-03 15:14:49.894+00	2025-08-29 10:09:51.29427+00	2025-09-05 07:45:46.695342+00
3b5b2936-8835-4913-a434-c2f2a0913f18	EFI	ES	018fe21d-909a-7521-b61f-be9329b39685	ES*EPK*ECPSIMEMPARK005*1	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":220,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-04T14:23:06.998Z"}]	\N	\N	9005	\N	\N	\N	2025-09-04 14:23:06.998+00	2025-08-29 10:09:51.331059+00	2025-09-05 07:45:46.737733+00
666c70a1-3471-4b77-bbea-ea9bc2e5e376	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*ESAC0009*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.860Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.86+00	2025-08-29 10:09:51.244526+00	2025-09-05 07:45:46.5939+00
7c15fffe-f2ee-4d3f-b669-39a256f2a99e	EFI	ES	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	ES*EPK*EQATEMPORARY*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:00.396Z"}]	\N	\N	TEMP	\N	\N	\N	2025-08-21 10:03:00.397+00	2025-08-29 10:09:51.336539+00	2025-09-02 12:56:30.612016+00
89fdc3d9-b36f-4ff7-830a-c751b8f4ba24	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*ESAC0013*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.861+00	2025-08-29 10:09:51.240353+00	2025-09-05 07:45:46.585618+00
372434c6-6d44-41ba-9929-f14af6a03b5b	EFI	ES	01905959-e67e-73be-83c3-5526e5e5bba3	ES*EPK*ECPSIMEMPARK017*2	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"2","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["0fd1155a-e00f-4e60-906d-9fafe3c7ab10"],"last_updated":"2025-09-03T15:13:50.658Z"}]	\N	\N	CPSIM_EMPARK_017	\N	\N	\N	2025-09-03 15:13:50.658+00	2025-08-29 10:09:51.32204+00	2025-09-05 07:45:46.669729+00
321ba735-5002-49b3-9f31-7030a991a2b8	EFI	ES	018fc9ee-4b90-7eb2-ad96-bcd916b52bf7	ES*EPK*ECPSIMEMPARK027*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":220,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:01.459Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:01.459+00	2025-08-29 10:09:51.317016+00	2025-09-05 07:45:46.708957+00
bb985c94-e762-45f7-a1a7-a7d1a1ddb5f9	EFI	ES	018fc9ee-4b90-7eb2-ad96-bcd916b52bf7	ES*EPK*ECPSIMEMPARK009*2	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"2","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-03T15:14:09.662Z"}]	\N	\N	EPK009*2	\N	\N	\N	2025-09-03 15:14:09.662+00	2025-08-29 10:09:51.312141+00	2025-09-05 07:45:46.713115+00
7259d532-cc47-4cbc-a574-7360cfaa0998	EFI	ES	018fc9ee-4b90-7eb2-ad96-bcd916b52bf7	ES*EPK*ECPSIMEMPARK007*1	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-04T14:23:05.002Z"}]	\N	\N	9007	\N	\N	\N	2025-09-04 14:23:05.002+00	2025-08-29 10:09:51.314755+00	2025-09-05 07:45:46.717006+00
bbb01b00-8822-4371-b03f-a81bdcc8cd87	EFI	ES	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	ES*EPK*ECPSIMEMPARK001*1	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":16,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-04T14:24:06.406Z"}]	\N	\N	9001	\N	\N	\N	2025-09-04 14:24:06.406+00	2025-08-29 10:09:51.34381+00	2025-09-05 07:45:46.755569+00
66666243-8196-4f75-ac26-c923445fb286	EFI	ES	018ee163-16fe-71b4-af50-87fe667c39dc	ES*EPK*ECPSIMEMPARK009*2	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"f9ec0f5d-eba9-43e7-bb21-9268b60a756e","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-02-21T12:46:23.395Z"}]	\N	\N	EPK009*2	\N	\N	\N	2025-02-21 12:46:23.395+00	2025-08-29 10:09:51.182474+00	2025-09-05 07:45:46.463491+00
a8a631d6-e03d-4a0d-aef3-c9d0a59607d7	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	ES*EPK*ESAC0004*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:02.861+00	2025-08-29 10:09:51.242577+00	2025-09-05 07:45:46.59012+00
8ef174c5-4050-44d1-89fb-b775318bb7ef	EFI	ES	01905959-e67e-73be-83c3-5526e5e5bba3	ES*EPK*ECPSIMEMPARK017*2	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"2","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_amperage":0,"tariff_ids":[],"last_updated":"2025-08-19T10:53:48.532Z"}]	\N	\N	CPSIM_EMPARK_017	\N	\N	\N	2025-08-19 10:53:48.532+00	2025-08-29 10:09:51.324165+00	2025-09-05 07:45:46.673472+00
447cbf95-8611-41c3-8b56-9497e5c0c76a	EFI	ES	018fc9ee-4b90-7eb2-ad96-bcd916b52bf7	ES*EPK*ECPSIMEMPARK015*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:01.459Z"}]	\N	\N	9990	\N	\N	\N	2025-08-21 10:03:01.459+00	2025-08-29 10:09:51.306391+00	2025-09-05 07:45:46.704471+00
c65c3053-e032-46d8-b5b8-4655dc1ea0c6	EFI	ES	018fc9ee-4b90-7eb2-ad96-bcd916b52bf7	ES*EPK*ECPSIMEMPARK009*1	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":220,"max_amperage":16,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-03T15:14:09.662Z"}]	\N	\N	EPK009*1	\N	\N	\N	2025-09-03 15:14:09.662+00	2025-08-29 10:09:51.304504+00	2025-09-05 07:45:46.727608+00
abdbc238-5e79-40bf-a911-82b20be3001a	EFI	ES	018fc9ee-4b90-7eb2-ad96-bcd916b52bf7	ES*EPK*ECPSIMEMPARK008*1	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-03T15:14:09.619Z"}]	\N	\N	9008	\N	\N	\N	2025-09-03 15:14:09.619+00	2025-08-29 10:09:51.309445+00	2025-09-05 07:45:46.730794+00
b0f1d3c8-6a06-4752-86c9-f4a9b92cc0ea	EFI	ES	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	ES*EPK*ECPSIMEMPARK002*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:00.396Z"}]	\N	\N	9002	\N	\N	\N	2025-08-21 10:03:00.396+00	2025-08-29 10:09:51.339142+00	2025-09-05 07:45:46.747548+00
a64a1a31-1048-4097-8329-40906726a73e	EFI	ES	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	ES*EPK*EiopCPTest*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":6,"max_amperage":7,"tariff_ids":[],"last_updated":"2025-08-21T10:03:00.396Z"}]	\N	\N	\N	\N	\N	\N	2025-08-21 10:03:00.396+00	2025-08-29 10:09:51.341648+00	2025-09-05 07:45:46.75157+00
2ab49146-965e-4ff5-bb7e-f8819a3bf049	EFI	ES	018e57b9-e423-73ec-a6e5-26cd3bf42153	ES*EPK*ECPSIMEMPARK005*1	REMOVED	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-02-21T12:44:22.618Z"}]	\N	\N	9005	\N	\N	\N	2025-02-21 12:44:22.618+00	2025-08-29 10:09:51.169439+00	2025-09-05 07:45:46.439477+00
269ca2e5-b206-4254-9230-e7e4189a1f39	EFI	ES	018fc9ee-4b90-7eb2-ad96-bcd916b52bf7	ES*EPK*ECPSIMEMPARK006*1	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"1","standard":"DOMESTIC_F","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":40,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-03T15:13:50.158Z"}]	\N	\N	9006	\N	\N	\N	2025-09-03 15:13:50.158+00	2025-08-29 10:09:51.302267+00	2025-09-05 07:45:46.723831+00
\.


--
-- Data for Name: emsp_locations; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.emsp_locations (id, emsp_party_id, emsp_country_code, location_id, name, address, city, postal_code, state, country, coordinates, related_locations, parking_type, evse_list, directions, operator, suboperator, owner, facilities, time_zone, opening_times, charging_when_closed, images, energy_mix, last_updated, created_at, updated_at) FROM stdin;
018fc9ee-4b90-7eb2-ad96-bcd916b52bf7	EFI	ES	018fc9ee-4b90-7eb2-ad96-bcd916b52bf7	Telpark - Simulado varios cargadores	Rosalia de Castro 2	Nigrán	36350	\N	ESP	{"latitude": "42.1392080", "longitude": "-8.8064190"}	\N	\N	[{"uid":"447cbf95-8611-41c3-8b56-9497e5c0c76a","evse_id":"ES*EPK*ECPSIMEMPARK015*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:01.459Z"}],"physical_reference":"9990","last_updated":"2025-08-21T10:03:01.459Z"},{"uid":"321ba735-5002-49b3-9f31-7030a991a2b8","evse_id":"ES*EPK*ECPSIMEMPARK027*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":220,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:01.459Z"}],"last_updated":"2025-08-21T10:03:01.459Z"},{"uid":"bb985c94-e762-45f7-a1a7-a7d1a1ddb5f9","evse_id":"ES*EPK*ECPSIMEMPARK009*2","status":"AVAILABLE","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"2","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-03T15:14:09.662Z"}],"physical_reference":"EPK009*2","last_updated":"2025-09-03T15:14:09.662Z"},{"uid":"7259d532-cc47-4cbc-a574-7360cfaa0998","evse_id":"ES*EPK*ECPSIMEMPARK007*1","status":"AVAILABLE","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-04T14:23:05.002Z"}],"physical_reference":"9007","last_updated":"2025-09-04T14:23:05.002Z"},{"uid":"269ca2e5-b206-4254-9230-e7e4189a1f39","evse_id":"ES*EPK*ECPSIMEMPARK006*1","status":"AVAILABLE","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"DOMESTIC_F","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":40,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-03T15:13:50.158Z"}],"physical_reference":"9006","last_updated":"2025-09-03T15:13:50.158Z"},{"uid":"c65c3053-e032-46d8-b5b8-4655dc1ea0c6","evse_id":"ES*EPK*ECPSIMEMPARK009*1","status":"AVAILABLE","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":220,"max_amperage":16,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-03T15:14:09.662Z"}],"physical_reference":"EPK009*1","last_updated":"2025-09-03T15:14:09.662Z"},{"uid":"abdbc238-5e79-40bf-a911-82b20be3001a","evse_id":"ES*EPK*ECPSIMEMPARK008*1","status":"AVAILABLE","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-03T15:14:09.619Z"}],"physical_reference":"9008","last_updated":"2025-09-03T15:14:09.619Z"}]	\N	{}	{}	{}	[]	Europe/Madrid	{}	\N	[]	{}	2025-09-04 14:23:05.045+00	2025-08-29 09:07:34.231892+00	2025-09-05 07:45:46.699291+00
018fc9cb-9fe6-752c-a7f9-db9684c55e90	EFI	ES	018fc9cb-9fe6-752c-a7f9-db9684c55e90	Telpark - Cargador real	Rosalia de Castro	Nigrán	1350	\N	ESP	{"latitude": "42.1387016", "longitude": "-8.8061677"}	\N	\N	[{"uid":"6af9fa56-5a49-41f9-bfd1-2dc8d5845927","evse_id":"ES*EPK*EEVCC01832*1","status":"OUTOFORDER","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":220,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-22T06:06:24.779Z"}],"physical_reference":"0001","last_updated":"2025-08-22T06:06:24.779Z"}]	\N	{}	{}	{}	[]	Europe/Madrid	{}	\N	[]	{}	2025-08-22 06:06:24.825+00	2025-08-29 09:07:34.218577+00	2025-09-05 07:45:46.625229+00
019831fa-6620-78e2-b936-d6a4db4c0eeb	EFI	ES	019831fa-6620-78e2-b936-d6a4db4c0eeb	Test Zone Spain	No info	No info	No info	\N	ESP	{"latitude": "42.4289355", "longitude": "-8.6454256"}	\N	\N	[{"uid":"393a97c4-1eb8-4db6-a20b-a1daef74c679","evse_id":"ES*EPK*EEVCC00019999999*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":30,"tariff_ids":["0fd1155a-e00f-4e60-906d-9fafe3c7ab10"],"last_updated":"2025-08-21T10:03:39.656Z"}],"physical_reference":"5672","last_updated":"2025-08-21T10:03:39.656Z"}]	\N	{}	{}	{}	[]	Europe/Madrid	{}	\N	[]	{}	2025-08-21 10:03:39.656+00	2025-08-29 09:07:34.214931+00	2025-09-05 07:45:46.616707+00
0191e1d9-3f25-70ae-a838-c31ec5cbd6d9	EFI	ES	0191e1d9-3f25-70ae-a838-c31ec5cbd6d9	Telpark - Gondomar	Plaza Rosalía de Castro	Gondomar	36333	\N	ESP	{"latitude": "42.1101486", "longitude": "-8.7615336"}	\N	\N	[{"uid":"0e188c59-79f3-4e51-b9d2-c8164f05748c","evse_id":"ES*EPK*ECPSIMEMPARK025*1","status":"AVAILABLE","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["2126c824-39d6-424d-8e61-3ebd402f5d4a"],"last_updated":"2025-09-03T15:13:49.729Z"}],"physical_reference":"9025","last_updated":"2025-09-03T15:13:49.729Z"},{"uid":"3e136d03-05bf-468f-a4ae-ac34a874f0d5","evse_id":"ES*EPK*ECPSIMEMPARK031*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-03-25T17:57:24.403Z"}],"physical_reference":"CPSIM_EMPARK_031","last_updated":"2025-03-25T17:57:24.403Z"}]	\N	{}	{}	{}	[]	Europe/Madrid	{}	\N	[]	{}	2025-09-03 15:13:49.778+00	2025-08-29 09:07:34.221664+00	2025-09-05 07:45:46.632733+00
01905a14-4179-7068-9db4-0456abf9dfb4	EFI	ES	01905a14-4179-7068-9db4-0456abf9dfb4	Roaming 004	No info	No info	No info	\N	ESP	{"latitude": "42.6824353", "longitude": "-7.5585937"}	\N	\N	[{"uid":"b6ac733f-d391-40ee-88e6-4ab25351435e","evse_id":"ES*EPK*ECPSIMEMPARK020*1","status":"AVAILABLE","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["0fd1155a-e00f-4e60-906d-9fafe3c7ab10"],"last_updated":"2025-09-03T15:14:49.920Z"}],"physical_reference":"CPSIM_EMPARK_020","last_updated":"2025-09-03T15:14:49.920Z"}]	\N	{}	{}	{}	[]	Europe/Madrid	{}	\N	[]	{}	2025-09-03 15:14:50.08+00	2025-08-29 09:07:34.224072+00	2025-09-05 07:45:46.677292+00
018fe21d-909a-7521-b61f-be9329b39685	EFI	ES	018fe21d-909a-7521-b61f-be9329b39685	Telpark - Simulado un cargador	Telleira	1	36350	\N	ESP	{"latitude": "42.1389687", "longitude": "-8.8080931"}	\N	\N	[{"uid":"3b5b2936-8835-4913-a434-c2f2a0913f18","evse_id":"ES*EPK*ECPSIMEMPARK005*1","status":"AVAILABLE","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":220,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-04T14:23:06.998Z"}],"physical_reference":"9005","last_updated":"2025-09-04T14:23:06.998Z"}]	\N	{}	{}	{}	[]	Europe/Madrid	{}	\N	[]	{}	2025-09-04 14:23:07.025+00	2025-08-29 09:07:34.237348+00	2025-09-05 07:45:46.733705+00
018e57b9-e423-73ec-a6e5-26cd3bf42153	EFI	ES	018e57b9-e423-73ec-a6e5-26cd3bf42153	Telpark - Test Roaming Interno 3	No info	No info	No info	\N	ESP	{"latitude": "42.1452165", "longitude": "-8.8551305"}	\N	\N	[{"uid":"2ab49146-965e-4ff5-bb7e-f8819a3bf049","evse_id":"ES*EPK*ECPSIMEMPARK005*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-02-21T12:44:22.618Z"}],"physical_reference":"9005","last_updated":"2025-02-21T12:44:22.618Z"}]	\N	{}	{}	{}	[]	Europe/Madrid	{}	\N	[]	{}	2024-06-02 04:01:44.27+00	2025-08-29 09:07:34.186496+00	2025-09-05 07:45:46.43093+00
0197abf8-9917-7f08-899c-f18eea04e72b	EFI	ES	0197abf8-9917-7f08-899c-f18eea04e72b	Telpark - Test Roaming interno 3	Praia américa 1	Nigrán	36350	\N	ESP	{"latitude": "42.1285113", "longitude": "-8.8194722"}	\N	\N	[{"uid":"708079bb-d739-4734-9d19-b59440436bb1","evse_id":"ES*EPK*ECPSIMEMPARK036*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":220,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:02.571Z"}],"last_updated":"2025-08-21T10:03:02.571Z"},{"uid":"0042e5d9-a7be-4a42-9875-e879b82336af","evse_id":"ES*EPK*ECPSIMEMPARK037*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":16,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:02.571Z"}],"last_updated":"2025-08-21T10:03:02.571Z"}]	\N	{}	{}	{}	[]	Europe/Madrid	{}	\N	[]	{}	2025-08-21 10:03:02.571+00	2025-08-29 09:07:34.201937+00	2025-09-05 07:45:46.50547+00
506fdb60-e60e-11ea-91b9-e7db7be04256	EFI	ES	506fdb60-e60e-11ea-91b9-e7db7be04256	Telpark - Área Central Santiago	Rua de Berlín s/n, Pol.Fontiñas, s/n	Santiago de Compostela	15703	\N	ESP	{"latitude": "42.8821953", "longitude": "-8.5264432"}	\N	\N	[{"uid":"4dc87a54-ff50-41b8-994e-7449eed3839d","evse_id":"ES*EPK*ESAC0016*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}],"last_updated":"2025-08-21T10:03:02.861Z"},{"uid":"95aed594-98b9-4259-9258-d8186fb91637","evse_id":"ES*EPK*ESAC0012*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}],"last_updated":"2025-08-21T10:03:02.861Z"},{"uid":"db1538c4-30a0-4850-a450-3fd674f76988","evse_id":"ES*EPK*ESAC0011*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.860Z"}],"last_updated":"2025-08-21T10:03:02.860Z"},{"uid":"dd4026a2-577e-4652-9b10-509ba4e71890","evse_id":"ES*EPK*ESAC0019*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.860Z"}],"last_updated":"2025-08-21T10:03:02.860Z"},{"uid":"4438b306-5bbd-4b09-9995-32d29a7d73e1","evse_id":"ES*EPK*ESAC0018*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}],"last_updated":"2025-08-21T10:03:02.861Z"},{"uid":"18a2eb5d-8415-4ac1-932e-73b64ef98d4f","evse_id":"ES*EPK*ESAC0007*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}],"last_updated":"2025-08-21T10:03:02.861Z"},{"uid":"b8dfbf46-afa3-45e8-877e-3ec40e82ce53","evse_id":"ES*EPK*ESAC0008*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}],"last_updated":"2025-08-21T10:03:02.861Z"},{"uid":"0ec58c98-25bf-4f11-895e-7d7ee8ec9141","evse_id":"ES*EPK*ESAC0006*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}],"last_updated":"2025-08-21T10:03:02.861Z"},{"uid":"450761cc-a1e5-4a19-aa9e-642d7711fa1b","evse_id":"ES*EPK*ESAC0014*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.860Z"}],"last_updated":"2025-08-21T10:03:02.860Z"},{"uid":"7b087cd9-f92c-4493-85b7-6269276a42b8","evse_id":"ES*EPK*ESAC0005*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.860Z"}],"last_updated":"2025-08-21T10:03:02.860Z"},{"uid":"a7b6b84c-6845-4c79-9e21-4f24e3d17fa1","evse_id":"ES*EPK*ESAC0010*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}],"last_updated":"2025-08-21T10:03:02.861Z"},{"uid":"89fdc3d9-b36f-4ff7-830a-c751b8f4ba24","evse_id":"ES*EPK*ESAC0013*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}],"last_updated":"2025-08-21T10:03:02.861Z"},{"uid":"a8a631d6-e03d-4a0d-aef3-c9d0a59607d7","evse_id":"ES*EPK*ESAC0004*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}],"last_updated":"2025-08-21T10:03:02.861Z"},{"uid":"666c70a1-3471-4b77-bbea-ea9bc2e5e376","evse_id":"ES*EPK*ESAC0009*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.860Z"}],"last_updated":"2025-08-21T10:03:02.860Z"},{"uid":"06d83c87-919f-41c1-8d84-727b414c8653","evse_id":"ES*EPK*ESAC0015*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}],"last_updated":"2025-08-21T10:03:02.861Z"},{"uid":"d16e666b-d069-4c57-8425-49a017874d09","evse_id":"ES*EPK*ESAC0017*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-08-21T10:03:02.861Z"}],"last_updated":"2025-08-21T10:03:02.861Z"},{"uid":"c512a9a2-8c95-4c7f-94ce-cc4e941ce9b6","evse_id":"ES*EPK*EEVCC02145*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:02.861Z"}],"physical_reference":"4208","last_updated":"2025-08-21T10:03:02.861Z"},{"uid":"cae0ddad-7324-4eb8-b422-6b39197bd623","evse_id":"ES*EPK*EEVCC02143*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:02.860Z"}],"physical_reference":"4206","last_updated":"2025-08-21T10:03:02.860Z"},{"uid":"5874b64b-fe2e-4be2-966b-e4fb10c1f043","evse_id":"ES*EPK*EEVCC02144*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:02.860Z"}],"physical_reference":"4207","last_updated":"2025-08-21T10:03:02.860Z"}]	\N	{}	{}	{}	[]	Europe/Madrid	{}	\N	[]	{}	2025-08-21 10:03:02.86+00	2025-08-29 09:07:34.209643+00	2025-09-05 07:45:46.527624+00
018f5c4e-8c7c-7358-83b2-cb03ea105590	EFI	ES	018f5c4e-8c7c-7358-83b2-cb03ea105590	Telpark - Test Roaming Interno 6	No info	No info	No info	\N	ESP	{"latitude": "43.3251776", "longitude": "-3.5156250"}	\N	\N	[{"uid":"966d3e7d-3cd0-48cc-a8b2-bfe0749a8058","evse_id":"ES*EPK*ECPSIMEMPARK010*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:02.309Z"}],"last_updated":"2025-08-21T10:03:02.309Z"},{"uid":"2bcd2937-a3bd-4ad8-9661-7e2afa1aa0e9","evse_id":"ES*EPK*ECPSIMEMPARK010*2","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"2","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:02.309Z"}],"last_updated":"2025-08-21T10:03:02.309Z"}]	\N	{}	{}	{}	[]	Europe/Madrid	{}	\N	[]	{}	2025-08-21 10:03:02.309+00	2025-08-29 09:07:34.197748+00	2025-09-05 07:45:46.485064+00
0197ac5a-b3ac-7551-909f-b44b5d416107	EFI	ES	0197ac5a-b3ac-7551-909f-b44b5d416107	Telpark - Test Roaming interno 4	monte lourido	nigran	36350	\N	ESP	{"latitude": "42.1229477", "longitude": "-8.8232557"}	\N	\N	[{"uid":"c447336d-3e5d-42b0-8405-8655d6a2b910","evse_id":"ES*EPK*ECPSIMEMPARK039*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":16,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:02.688Z"}],"last_updated":"2025-08-21T10:03:02.688Z"},{"uid":"3f5f7365-fca8-40ce-9691-6ab39cb7c907","evse_id":"ES*EPK*ECPSIMEMPARK040*1","status":"AVAILABLE","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":16,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-03T15:13:49.486Z"}],"physical_reference":"CPSIM_EMPARK_040","last_updated":"2025-09-03T15:13:49.486Z"},{"uid":"806c6e43-89e1-49a9-8284-9397a8ad920f","evse_id":"ES*EPK*ECPSIMEMPARK038*1","status":"AVAILABLE","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":220,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-03T15:13:50.673Z"}],"physical_reference":"CPSIM_EMPARK_038","last_updated":"2025-09-03T15:13:50.673Z"}]	\N	{}	{}	{}	[]	Europe/Madrid	{}	\N	[]	{}	2025-09-03 15:13:50.966+00	2025-08-29 09:07:34.226542+00	2025-09-05 07:45:46.645591+00
018ee163-16fe-71b4-af50-87fe667c39dc	EFI	ES	018ee163-16fe-71b4-af50-87fe667c39dc	Telpark - Test Roaming Interno 5	No info	No info	No info	\N	ESP	{"latitude": "42.0329743", "longitude": "-7.3828125"}	\N	\N	[{"uid":"66666243-8196-4f75-ac26-c923445fb286","evse_id":"ES*EPK*ECPSIMEMPARK009*2","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"f9ec0f5d-eba9-43e7-bb21-9268b60a756e","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":[],"last_updated":"2025-02-21T12:46:23.395Z"}],"physical_reference":"EPK009*2","last_updated":"2025-02-21T12:46:23.395Z"},{"uid":"870a3fc5-f2d3-4671-b9e2-ca25a7cccd4e","evse_id":"ES*EPK*ECPSIMEMPARK008*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-02-21T12:42:20.512Z"}],"physical_reference":"9008","last_updated":"2025-02-21T12:42:20.512Z"},{"uid":"ed741323-0fc2-46ee-b54e-94b6955ef017","evse_id":"ES*EPK*ECPSIMEMPARK009*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-02-21T12:46:23.395Z"}],"physical_reference":"EPK009*1","last_updated":"2025-02-21T12:46:23.395Z"}]	\N	{}	{}	{}	[]	Europe/Madrid	{}	\N	[]	{}	2024-06-02 04:01:44.289+00	2025-08-29 09:07:34.194737+00	2025-09-05 07:45:46.452869+00
01905959-e67e-73be-83c3-5526e5e5bba3	EFI	ES	01905959-e67e-73be-83c3-5526e5e5bba3	Roaming 002	No info	No info	No info	\N	ESP	{"latitude": "38.2726885", "longitude": "-4.21875"}	\N	\N	[{"uid":"95b81e45-3399-46c8-9828-2a38beac27d5","evse_id":"ES*EPK*ECPSIMEMPARK017*1","status":"AVAILABLE","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["0fd1155a-e00f-4e60-906d-9fafe3c7ab10"],"last_updated":"2025-09-03T15:13:50.658Z"}],"physical_reference":"CPSIM_EMPARK_017","last_updated":"2025-09-03T15:13:50.658Z"},{"uid":"372434c6-6d44-41ba-9929-f14af6a03b5b","evse_id":"ES*EPK*ECPSIMEMPARK017*2","status":"AVAILABLE","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"2","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["0fd1155a-e00f-4e60-906d-9fafe3c7ab10"],"last_updated":"2025-09-03T15:13:50.658Z"}],"physical_reference":"CPSIM_EMPARK_017","last_updated":"2025-09-03T15:13:50.658Z"},{"uid":"8ef174c5-4050-44d1-89fb-b775318bb7ef","evse_id":"ES*EPK*ECPSIMEMPARK017*2","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"2","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_amperage":0,"tariff_ids":[],"last_updated":"2025-08-19T10:53:48.532Z"}],"physical_reference":"CPSIM_EMPARK_017","last_updated":"2025-08-19T10:53:48.532Z"}]	\N	{}	{}	{}	[]	Europe/Madrid	{}	\N	[]	{}	2025-09-03 15:13:50.988+00	2025-08-29 09:07:34.234577+00	2025-09-05 07:45:46.662744+00
01946e8d-0656-7d2c-b055-d0faf4340f94	EFI	ES	01946e8d-0656-7d2c-b055-d0faf4340f94	Área de test	Avd w 2	No info	No info	\N	ESP	{"latitude": "39.7725217", "longitude": "-4.8121897"}	\N	\N	[{"uid":"b8855bc2-3019-4370-9399-4310c2bd573b","evse_id":"ES*EPK*EWENEA001*1","status":"AVAILABLE","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["0fd1155a-e00f-4e60-906d-9fafe3c7ab10"],"last_updated":"2025-09-03T15:16:09.413Z"}],"physical_reference":"WENEA_001","last_updated":"2025-09-03T15:16:09.413Z"},{"uid":"690a36a7-52ac-4058-b1a8-646f248ea45c","evse_id":"ES*EPK*EEVCC0001*1","status":"AVAILABLE","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["0fd1155a-e00f-4e60-906d-9fafe3c7ab10"],"last_updated":"2025-09-03T15:14:49.894Z"}],"physical_reference":"alf-EV000000001","last_updated":"2025-09-03T15:14:49.894Z"}]	\N	{}	{}	{}	[]	Europe/Madrid	{}	\N	[]	{}	2025-09-04 09:50:53.718+00	2025-08-29 09:07:34.228962+00	2025-09-05 07:45:46.687028+00
f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EFI	ES	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	Telpark - Test Roaming Interno	Rua das Ponte 2	Nigrán	36350	\N	ESP	{"latitude": "42.1404900", "longitude": "-8.7909488"}	\N	\N	[{"uid":"b0f1d3c8-6a06-4752-86c9-f4a9b92cc0ea","evse_id":"ES*EPK*ECPSIMEMPARK002*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-08-21T10:03:00.396Z"}],"physical_reference":"9002","last_updated":"2025-08-21T10:03:00.396Z"},{"uid":"a64a1a31-1048-4097-8329-40906726a73e","evse_id":"ES*EPK*EiopCPTest*1","status":"REMOVED","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":6,"max_amperage":7,"tariff_ids":[],"last_updated":"2025-08-21T10:03:00.396Z"}],"last_updated":"2025-08-21T10:03:00.396Z"},{"uid":"bbb01b00-8822-4371-b03f-a81bdcc8cd87","evse_id":"ES*EPK*ECPSIMEMPARK001*1","status":"AVAILABLE","capabilities":["REMOTE_START_STOP_CAPABLE","RFID_READER"],"connectors":[{"id":"1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":16,"tariff_ids":["e6d35fc3-8c63-43d8-9233-f1834bb72b2e"],"last_updated":"2025-09-04T14:24:06.406Z"}],"physical_reference":"9001","last_updated":"2025-09-04T14:24:06.406Z"}]	\N	{}	{}	{}	[]	Europe/Madrid	{"twentyfourseven":true}	\N	[]	{}	2025-09-04 14:24:06.439+00	2025-08-29 09:07:34.24002+00	2025-09-05 07:45:46.742071+00
\.


--
-- Data for Name: emsp_sessions; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.emsp_sessions (id, emsp_party_id, emsp_country_code, session_id, evse_uid, connector_id, id_token, start_datetime, end_datetime, total_cost, status, last_updated, created_at, updated_at, country_code, party_id, start_date_time, end_date_time, kwh, cdr_token, auth_method, location_id, currency, charging_periods) FROM stdin;
2a3e0d91-a9d8-4ea7-bfb9-a8f7b5f92b39	EFI	ES	f3dfe690-8a4c-11f0-a3b3-edfacb42f5d4	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-05 11:39:16+00	\N	4.20	COMPLETED	2025-09-05 11:39:20.613+00	2025-09-05 11:39:16.46786+00	2025-09-05 11:39:20.789492+00	ES	EFI	2025-09-05 11:39:16+00	2025-09-05 11:39:20+00	0.000	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0}], "start_date_time": "1970-01-01T00:00:00.000Z"}]
daf2fcb3-3458-490d-8205-9971a40f2273	EFI	ES	5298b920-898d-11f0-b739-db6e17147819	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-04 12:47:31+00	\N	0.00	COMPLETED	2025-09-04 12:48:42.431+00	2025-09-04 12:47:31.96923+00	2025-09-04 12:48:42.590446+00	ES	EFI	2025-09-04 12:47:31+00	2025-09-04 12:48:42+00	0.030	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0}], "start_date_time": "1970-01-01T00:00:00.000Z"}]
f8418a87-bf7c-4ff7-8a15-d14b93546cf5	EFI	ES	4470ce50-8983-11f0-b739-db6e17147819	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-04 11:35:32+00	\N	4.20	COMPLETED	2025-09-04 12:15:20.545+00	2025-09-04 11:35:33.246424+00	2025-09-04 12:15:20.681885+00	ES	EFI	2025-09-04 11:35:32+00	2025-09-04 12:15:20+00	1.190	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0}], "start_date_time": "2025-09-04T11:35:33.099Z"}]
389238c7-6cbd-4a8a-a2bf-be86aec04b58	EFI	ES	c749ec20-8a51-11f0-a3b3-edfacb42f5d4	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-05 12:13:48+00	\N	0.00	COMPLETED	2025-09-05 12:16:25.026+00	2025-09-05 12:13:49.146335+00	2025-09-05 12:16:25.123469+00	ES	EFI	2025-09-05 12:13:48+00	2025-09-05 12:16:24+00	0.080	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0.0433}], "start_date_time": "2025-09-05T12:13:48.948Z"}]
ae7e8678-f3d3-421b-b62e-dedfa8645b8a	EFI	ES	test-session-final-success	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	test-token	2025-09-04 10:00:00+00	\N	4.20	COMPLETED	2025-09-04 10:40:06.866+00	2025-09-04 10:40:06.870481+00	2025-09-04 10:42:42.067799+00	ES	EFI	2025-09-04 10:00:00+00	2025-09-04 10:30:00+00	1.000	{"uid": "test-token", "type": "OTHER"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0}], "start_date_time": "2025-09-04T10:00:00Z"}]
5704e86a-bfcd-4d58-b023-052d2c2df4b4	EFI	ES	7c260330-8a53-11f0-a3b3-edfacb42f5d4	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-05 12:26:01+00	\N	4.20	COMPLETED	2025-09-05 12:27:34.364+00	2025-09-05 12:26:56.39493+00	2025-09-05 12:27:34.645873+00	ES	EFI	2025-09-05 12:26:01+00	2025-09-05 12:27:34+00	0.040	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0.0256}], "start_date_time": "2025-09-05T12:26:01.876Z"}]
82abb870-c4cb-4ce1-9bcf-cfb122fac7b4	EFI	ES	f92feab0-8988-11f0-b739-db6e17147819	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-04 12:16:23+00	\N	0.00	COMPLETED	2025-09-04 12:19:53.168+00	2025-09-04 12:16:23.959708+00	2025-09-04 12:19:53.278624+00	ES	EFI	2025-09-04 12:16:23+00	2025-09-04 12:19:52+00	0.110	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0}], "start_date_time": "1970-01-01T00:00:00.000Z"}]
87b4a4f5-b91e-44de-8c5b-e0eb20867f0a	EFI	ES	0705bcb0-8979-11f0-b739-db6e17147819	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-04 10:22:14+00	\N	4.20	COMPLETED	2025-09-04 10:49:11.028+00	2025-09-04 10:40:08.045143+00	2025-09-04 10:49:11.111952+00	ES	EFI	2025-09-04 10:22:14+00	2025-09-04 10:49:10+00	0.810	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0}], "start_date_time": "2025-09-04T10:22:15.105Z"}]
aa7eb01d-0c83-4bcc-a9fe-4a0d373db285	EFI	ES	d143b1f0-897c-11f0-b739-db6e17147819	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-04 10:49:22+00	\N	0.00	COMPLETED	2025-09-04 10:49:48.177+00	2025-09-04 10:49:23.030266+00	2025-09-04 10:49:48.234253+00	ES	EFI	2025-09-04 10:49:22+00	2025-09-04 10:49:47+00	0.020	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0}], "start_date_time": "1970-01-01T00:00:00.000Z"}]
48d5535f-e07c-4084-aa3d-400151a55154	EFI	ES	19ea53f0-897d-11f0-b739-db6e17147819	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-04 10:51:24+00	\N	0.00	COMPLETED	2025-09-04 10:52:20.719+00	2025-09-04 10:51:24.922151+00	2025-09-04 10:52:20.918781+00	ES	EFI	2025-09-04 10:51:24+00	2025-09-04 10:52:20+00	0.030	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0}], "start_date_time": "1970-01-01T00:00:00.000Z"}]
c4610630-e2c6-4ff4-b01b-7761e9e162c3	EFI	ES	10746200-897f-11f0-b739-db6e17147819	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-04 11:05:27+00	\N	4.20	COMPLETED	2025-09-04 11:20:53.331+00	2025-09-04 11:05:28.075552+00	2025-09-04 11:20:53.42058+00	ES	EFI	2025-09-04 11:05:27+00	2025-09-04 11:20:53+00	0.470	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0}], "start_date_time": "2025-09-04T11:05:27.900Z"}]
20eb2766-244e-42aa-944b-41e23db72f1d	EFI	ES	401b8fe0-8981-11f0-b739-db6e17147819	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-04 11:21:06+00	\N	0.00	COMPLETED	2025-09-04 11:23:36.482+00	2025-09-04 11:21:06.970685+00	2025-09-04 11:23:36.577085+00	ES	EFI	2025-09-04 11:21:06+00	2025-09-04 11:23:36+00	0.080	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0}], "start_date_time": "1970-01-01T00:00:00.000Z"}]
c7dd93f8-15fa-42fb-98b5-cd965fed66d6	EFI	ES	aa908280-897d-11f0-b739-db6e17147819	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-04 10:55:27+00	\N	0.00	COMPLETED	2025-09-04 11:00:57.558+00	2025-09-04 10:55:27.597134+00	2025-09-04 11:00:57.66294+00	ES	EFI	2025-09-04 10:55:27+00	2025-09-04 11:00:57+00	0.170	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0}], "start_date_time": "1970-01-01T00:00:00.000Z"}]
07880f7c-c218-4d79-b177-771e0a06c8b9	EFI	ES	414dd8e0-8982-11f0-b739-db6e17147819	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-04 11:28:18+00	\N	0.00	COMPLETED	2025-09-04 11:28:30.794+00	2025-09-04 11:28:18.493906+00	2025-09-04 11:28:30.88798+00	ES	EFI	2025-09-04 11:28:18+00	2025-09-04 11:28:30+00	0.010	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0}], "start_date_time": "1970-01-01T00:00:00.000Z"}]
7464b052-fa1f-4597-bb55-0dd8ad1d81a3	EFI	ES	47f6b520-8a51-11f0-a3b3-edfacb42f5d4	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-05 12:10:15+00	\N	4.20	COMPLETED	2025-09-05 12:10:26.233+00	2025-09-05 12:10:15.521234+00	2025-09-05 12:10:26.298436+00	ES	EFI	2025-09-05 12:10:15+00	2025-09-05 12:10:26+00	0.010	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0.0031}], "start_date_time": "2025-09-05T12:10:15.329Z"}]
6b521b71-dca5-4230-b408-7a5ede66a09f	EFI	ES	3f0d2190-898b-11f0-b739-db6e17147819	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-04 12:32:39+00	\N	0.00	COMPLETED	2025-09-04 12:46:59.02+00	2025-09-04 12:32:40.325686+00	2025-09-04 12:46:59.131097+00	ES	EFI	2025-09-04 12:32:39+00	2025-09-04 12:46:58+00	0.430	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0}], "start_date_time": "1970-01-01T00:00:00.000Z"}]
961c30e7-235a-45af-ac68-e5a7d6dabb79	EFI	ES	a64ba6b0-899a-11f0-b739-db6e17147819	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-04 14:22:55+00	\N	4.20	COMPLETED	2025-09-04 14:24:06.492+00	2025-09-04 14:22:55.996821+00	2025-09-04 14:24:06.557677+00	ES	EFI	2025-09-04 14:22:55+00	2025-09-04 14:24:06+00	0.030	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0.0194}], "start_date_time": "2025-09-04T14:22:55.704Z"}]
cbb582f5-a71a-4f84-9b79-f2ca8869d98a	EFI	ES	beb188f0-8a53-11f0-a3b3-edfacb42f5d4	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-05 12:27:53+00	2025-09-05 15:30:00+00	4.20	COMPLETED	2025-09-05 12:28:02.565+00	2025-09-05 12:27:53.733905+00	2025-09-05 16:13:34.691+00	ES	EFI	2025-09-05 12:27:53+00	2025-09-05 12:28:02+00	0.010	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0.0025}], "start_date_time": "2025-09-05T12:27:53.517Z"}]
a1514034-5e4e-49b4-85a1-dff58456791d	EFI	ES	e0eba8a0-8a2c-11f0-b739-db6e17147819	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-05 07:49:40+00	\N	4.20	COMPLETED	2025-09-05 07:51:07.574+00	2025-09-05 07:49:40.857127+00	2025-09-05 07:51:07.688152+00	ES	EFI	2025-09-05 07:49:40+00	2025-09-05 07:51:07+00	0.040	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0.0242}], "start_date_time": "2025-09-05T07:49:40.581Z"}]
c9bd0a4d-3765-4be2-8e8a-a57038497a38	EPK	ES	9a8240f0-8972-11f0-b739-db6e17147819	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	9a8240f0-8972-11f0-b739-db6e17147819	2025-09-04 09:36:15+00	2025-09-04 09:37:01+00	4.20	COMPLETED	2025-09-04 09:37:01.446+00	2025-09-05 10:48:52.695+00	2025-09-05 10:48:52.695+00	ES	EFI	2025-09-04 09:36:15+00	2025-09-04 09:37:01+00	0.020	\N	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0.0125}], "start_date_time": "2025-09-04T09:36:16.053Z"}]
d347b0f5-f229-4ff2-a796-70a2aceae311	EPK	ES	b109cfe0-8973-11f0-b739-db6e17147819	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	b109cfe0-8973-11f0-b739-db6e17147819	2025-09-04 09:44:03+00	2025-09-04 09:44:46+00	4.20	COMPLETED	2025-09-04 09:44:47.047+00	2025-09-05 10:48:52.709+00	2025-09-05 10:48:52.709+00	ES	EFI	2025-09-04 09:44:03+00	2025-09-04 09:44:46+00	0.020	\N	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0.0119}], "start_date_time": "2025-09-04T09:44:03.376Z"}]
ecf718a1-8711-46ed-9d7e-2d1163962037	EFI	ES	f42c7130-8a52-11f0-a3b3-edfacb42f5d4	bbb01b00-8822-4371-b03f-a81bdcc8cd87	1	ad-hoc-user-003	2025-09-05 12:22:13+00	2025-09-05 16:14:03.58+00	4.20	COMPLETED	2025-09-05 16:14:03.58+00	2025-09-05 12:22:14.076222+00	2025-09-05 16:14:03.641+00	ES	EFI	2025-09-05 12:22:13+00	\N	0.080	{"uid": "ad-hoc-user-003", "type": "AD_HOC_USER", "contract_id": "contract-003"}	AUTH_REQUEST	f5a3bc90-9da4-11ee-a8bd-1f0443e85fef	EUR	[{"dimensions": [{"type": "TIME", "volume": 0}], "start_date_time": "2025-09-05T12:22:13.754Z"}]
\.


--
-- Data for Name: emsp_tariffs; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.emsp_tariffs (id, emsp_party_id, emsp_country_code, tariff_id, currency, type, elements, start_date_time, end_date_time, last_updated, created_at, updated_at) FROM stdin;
b43159c5-dbcb-497a-a902-d9d98319e220	EFI	ES	b43159c5-dbcb-497a-a902-d9d98319e220	EUR	REGULAR	[{"price_components":[{"vat":7,"type":"FLAT","price":0,"step_size":1}]},{"restrictions":{},"price_components":[{"vat":7,"type":"ENERGY","price":0.39,"step_size":1000}]}]	\N	\N	2025-08-21 10:03:39+00	2025-09-01 08:29:10.378344+00	2025-09-05 07:45:55.42857+00
0fd1155a-e00f-4e60-906d-9fafe3c7ab10	EFI	ES	0fd1155a-e00f-4e60-906d-9fafe3c7ab10	EUR	REGULAR	[{"price_components":[{"vat":21,"type":"FLAT","price":2.1,"step_size":1}]}]	\N	\N	2025-08-21 10:03:39+00	2025-09-01 08:29:10.380938+00	2025-09-05 07:45:55.433798+00
40a6db2e-926c-4557-804c-22b633b6d9cc	EFI	ES	40a6db2e-926c-4557-804c-22b633b6d9cc	EUR	REGULAR	[{"price_components":[{"type":"FLAT","price":1,"step_size":1}]},{"restrictions":{},"price_components":[{"type":"ENERGY","price":0.19,"step_size":1000}]}]	\N	\N	2025-08-26 09:43:58+00	2025-09-01 08:29:10.383966+00	2025-09-05 07:45:55.437782+00
9dc32e20-fdcd-11ec-a4da-8323ac78d56e	EFI	ES	9dc32e20-fdcd-11ec-a4da-8323ac78d56e	EUR	REGULAR	[{"price_components":[{"type":"FLAT","price":0.35,"step_size":1}]},{"restrictions":{},"price_components":[{"type":"ENERGY","price":0.45,"step_size":1000}]}]	\N	\N	2025-05-16 13:21:05+00	2025-09-01 08:29:10.358111+00	2025-09-05 07:45:55.400661+00
a43b2cb0-4e38-11ed-83cc-4b22e3eee135	EFI	ES	a43b2cb0-4e38-11ed-83cc-4b22e3eee135	EUR	REGULAR	[{"price_components":[{"type":"FLAT","price":0.35,"step_size":1}]},{"restrictions":{},"price_components":[{"type":"ENERGY","price":0.45,"step_size":1000}]}]	\N	\N	2025-05-16 13:21:05+00	2025-09-01 08:29:10.361581+00	2025-09-05 07:45:55.408524+00
5922cf50-dea8-427d-abbb-4b9c16456549	EFI	ES	5922cf50-dea8-427d-abbb-4b9c16456549	EUR	REGULAR	[{"price_components":[{"vat":21,"type":"FLAT","price":0.1235,"step_size":1}]},{"restrictions":{},"price_components":[{"vat":21,"type":"ENERGY","price":0.1935,"step_size":1000}]},{"restrictions":{},"price_components":[{"vat":21,"type":"TIME","price":0.0412,"step_size":60}]}]	\N	\N	2025-07-30 12:16:33+00	2025-09-01 08:29:10.364497+00	2025-09-05 07:45:55.412653+00
e6d35fc3-8c63-43d8-9233-f1834bb72b2e	EFI	ES	e6d35fc3-8c63-43d8-9233-f1834bb72b2e	EUR	REGULAR	[{"price_components":[{"vat":21,"type":"FLAT","price":4.2,"step_size":1}]}]	\N	\N	2025-08-21 10:03:01+00	2025-09-01 08:29:10.368402+00	2025-09-05 07:45:55.416819+00
d858cfff-7727-4680-b4f5-a921c69fec1c	EFI	ES	d858cfff-7727-4680-b4f5-a921c69fec1c	EUR	REGULAR	[{"price_components":[{"vat":21,"type":"FLAT","price":0.25,"step_size":1}]}]	\N	\N	2025-08-21 10:03:12+00	2025-09-01 08:29:10.371976+00	2025-09-05 07:45:55.420423+00
2126c824-39d6-424d-8e61-3ebd402f5d4a	EFI	ES	2126c824-39d6-424d-8e61-3ebd402f5d4a	EUR	REGULAR	[{"price_components":[{"vat":21,"type":"FLAT","price":0.7891,"step_size":1}]},{"restrictions":{},"price_components":[{"vat":21,"type":"ENERGY","price":0.1957,"step_size":1000}]},{"restrictions":{},"price_components":[{"vat":21,"type":"TIME","price":0.0499,"step_size":60}]}]	\N	\N	2025-08-21 10:03:38+00	2025-09-01 08:29:10.375078+00	2025-09-05 07:45:55.424515+00
\.


--
-- Data for Name: emsp_tokens; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.emsp_tokens (id, emsp_party_id, emsp_country_code, token_uid, type, contract_id, visual_number, issuer, group_id, valid, whitelist, language, default_profile_type, energy_contract, last_updated, created_at, updated_at) FROM stdin;
EFI-TEST_TOKEN_001	EFI	ES	TEST_TOKEN_001	RFID	ES-EFI-TEST-001-UPDATED	\N	empark_updated	\N	f	ALWAYS	\N	\N	\N	2025-09-01 09:02:29.468+00	2025-09-01 09:02:07.435+00	2025-09-01 09:02:29.468+00
EFI-MOCK_TEST_KEY	EFI	ES	MOCK_TEST_KEY	OTHER	ES-EFI-CE2A21CBB-4	\N	empark	\N	t	NEVER	\N	\N	\N	2025-09-01 09:04:55.547+00	2025-09-01 09:04:32.037+00	2025-09-01 09:04:55.548+00
EFI-XILAY0CB43NV2IXDAROA	EFI	ES	XILAY0CB43NV2IXDAROA	OTHER	ES-EFI-CE4592D96-1	\N	empark	\N	t	NEVER	\N	\N	\N	2025-09-04 14:37:43.374+00	2025-09-04 14:37:43.376+00	2025-09-04 14:37:43.376+00
EFI-TESTQAEMPARK002	EFI	ES	TESTQAEMPARK002	OTHER	ES-EFI-CFAE574F0-G	\N	empark	\N	t	NEVER	\N	\N	\N	2025-09-04 14:46:28.974+00	2025-09-04 14:46:28.975+00	2025-09-04 14:46:28.975+00
\.


--
-- Data for Name: evses; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.evses (id, location_id, country_code, party_id, evse_id, status, capabilities, connectors, floor_level, coordinates, physical_reference, directions, parking_restrictions, group_id, last_updated, created_at, updated_at, deleted_at) FROM stdin;
5dd3272e-1bfa-48dd-aa61-30da31df909f	56547430-64c0-4b7d-a266-fcf71bd2aecc	ES	IPD	ES*IPD*manual*113	AVAILABLE	["on","on","CHARGING_PROFILE_CAPABLE","RFID_READER"]	[{"id":"792c429d-46b2-4d95-8563-03202e595574","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-01T14:28:32.097Z"}]	\N	\N	manual	\N	\N	\N	2025-09-01 14:57:03.356+00	2025-09-01 14:28:32.122+00	2025-09-01 14:57:03.356+00	2025-09-01 14:57:03.356+00
4d69ec4f-41f7-495f-90cd-2e3878d2ba5d	test-location-001	ES	IPD	ES*IPD*TEST*001	AVAILABLE	["RESERVABLE"]	[{"id":"test-connector-001","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-01T14:30:00.000Z"}]	\N	\N	\N	\N	\N	\N	2025-09-01 14:36:23.959+00	2025-09-01 14:36:16.237+00	2025-09-01 14:36:23.959+00	2025-09-01 14:36:23.959+00
246e05c6-7493-402f-baff-0ac1afe54e48	test-location-with-evses	ES	IPD	ES*IPD*TESTLOC*002	AVAILABLE	["RESERVABLE","RFID_READER"]	[{"id":"test-connector-loc-002","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-01T14:45:00.000Z"}]	\N	\N	\N	\N	\N	\N	2025-09-01 14:46:27.235+00	2025-09-01 14:45:21.231+00	2025-09-01 14:46:27.235+00	2025-09-01 14:46:27.235+00
52730149-f342-4235-addf-fa3a400ab94a	test-location-with-evses	ES	IPD	ES*IPD*TESTLOC*001	AVAILABLE	["RESERVABLE"]	[{"id":"test-connector-loc-001","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-01T14:45:00.000Z"}]	\N	\N	\N	\N	\N	\N	2025-09-01 14:46:27.257+00	2025-09-01 14:45:07.049+00	2025-09-01 14:46:27.257+00	2025-09-01 14:46:27.257+00
5c8ed9d3-09f7-4444-8a85-595c0eabeebc	2a68c822-67d6-408b-9a86-ef782b65a3db	ES	IPD	ES*IPD*E5c8ed9d3	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"0563bdaa-50a3-446c-a885-faa980254216","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":["dd904a39-2665-4b1b-9a51-580556ba1842"],"last_updated":"2025-09-05T10:13:25.715Z"}]	\N	\N	test	\N	\N	\N	2025-09-05 10:13:25.718061+00	2025-09-03 11:12:09.545+00	2025-09-05 10:13:22.956+00	\N
d872eaec-6b4e-465f-a72d-083fc354e58c	2a68c822-67d6-408b-9a86-ef782b65a3db	ES	IPD	ES*IPD*publish*527	AVAILABLE	["CHARGING_PROFILE_CAPABLE"]	[{"id":"66a63c73-07e4-44b5-b356-8a753469e67e","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","voltage":230,"amperage":32,"max_power":null}]	\N	\N	evse_noche	\N	\N	\N	2025-09-01 20:10:53.79+00	2025-09-01 19:50:31.479+00	2025-09-01 20:10:53.791+00	2025-09-01 20:10:53.79+00
b730cfa9-6605-4ea2-8929-c1769da6c5c1	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000006	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"a2d7ec16-c0ea-41e4-99fe-b79e50bd3186","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC6	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
e14fb8ef-8cd4-44c5-807e-fb2f17f56c7f	350cb15c-b542-4191-a93b-3008054cc407	ES	IPD	ES*IPD*Ee14fb8ef	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"22d7f310-767e-4799-8182-6f6e3bbf7e4c","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":["14ed4eb6-b854-4611-a1c0-8d9f8b0d81f9"],"last_updated":"2025-09-05T10:33:38.915Z"}]	\N	\N	tariff	\N	\N	\N	2025-09-05 10:33:38.916841+00	2025-09-05 10:14:00.837+00	2025-09-05 10:14:22.99+00	\N
e7afc0a1-3774-42b9-be6b-1ebf773c9cb6	697918ae-f065-4d76-8259-49b4ac8f9ad3	ES	IPD	ES*IPD*Ee7afc0a1	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "927214cc-f311-4d9f-985d-90a0a98b947e", "standard": "IEC_62196_T2", "format": "SOCKET", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "41.3851", "longitude": "2.1734"}	Zona B - Nivel 0	\N	\N	\N	2025-09-04 14:33:16.22+00	2025-09-01 09:45:22.216546+00	2025-09-04 14:33:16.22+00	\N
3f99cf10-4592-4d48-825d-c70d4e59e44b	350cb15c-b542-4191-a93b-3008054cc407	ES	IPD	ES*IPD*E3f99cf10	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"b9588185-43ad-4a57-a14c-71e118c129c2","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-05T10:11:07.997Z"},{"id":"1ad38cc7-09a1-4344-8994-cd3b3772aaab","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-05T10:11:07.997Z"}]	\N	\N	doble	\N	\N	\N	2025-09-05 10:13:34.058+00	2025-09-05 07:06:26.459+00	2025-09-05 10:13:34.059+00	2025-09-05 10:13:34.058+00
9557a465-5697-428d-971f-a8b1bf41a01d	2a68c822-67d6-408b-9a86-ef782b65a3db	ES	IPD	ES*IPD*publish*187	AVAILABLE	["on","on","on","CHARGING_PROFILE_CAPABLE","RFID_READER"]	[{"id":"66a63c73-07e4-44b5-b356-8a753469e67e","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-01T20:11:10.780Z"},{"id":"39a669e7-fa0d-464f-98ef-fe63b918714e","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-01T20:11:10.780Z"}]	\N	\N	test	\N	\N	\N	2025-09-01 20:20:32.102+00	2025-09-01 20:11:10.805+00	2025-09-01 20:20:32.103+00	2025-09-01 20:20:32.102+00
f27af555-a853-4b10-8591-e2ac964e0407	test-location-notification-2	ES	IPD	ES*IPD*TESTNOT*001	AVAILABLE	["RESERVABLE","RFID_READER"]	[{"id":"test-connector-notification","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-01T14:56:00.000Z"}]	\N	\N	\N	\N	\N	\N	2025-09-01 14:57:06.151+00	2025-09-01 14:53:53.178+00	2025-09-01 14:57:06.152+00	2025-09-01 14:57:06.151+00
7e28b750-df72-4f51-bf49-03b38693a485	0988de25-ce61-4e75-8663-1117dbe2e6b4	ES	IPD	ES*IPD*E7e28b750	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "6c1f885e-4b6d-4c12-93d0-abaef995a319", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "43.2627", "longitude": "-2.9253"}	Zona E - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.926136+00	2025-09-03 11:05:20.898971+00	\N
0b8946d4-5c08-4931-936a-96a01694a704	0c94bd04-4cb9-46b8-bd06-58902c06ea3d	ES	IPD	ES*IPD*E0b8946d4	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "297ec33d-a53b-46ee-ae58-d46a70a34bc6", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "37.1765", "longitude": "-3.5976"}	Zona H - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.937763+00	2025-09-03 11:05:20.898971+00	\N
24c905f1-e07e-4d01-ade5-f1ef9c510a8c	ff2daf54-5ac6-441f-9b4b-4c715e66d12e	ES	IPD	ES*IPD*E24c905f1	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "049b15d2-b310-4447-bd8f-0ba5b4e9b226", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "40.4168", "longitude": "-3.7038"}	Zona A - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.201836+00	2025-09-03 11:05:20.898971+00	\N
88f990f0-1594-467d-a928-12a9fc539e3f	c7f1faa4-25cc-48dc-afec-e4747dc2ea49	ES	IPD	ES*IPD*E88f990f0	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "81d2d693-3123-49b5-84f1-d32afb3c05e0", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "36.7213", "longitude": "-4.4217"}	Zona F - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.935761+00	2025-09-03 11:05:20.898971+00	\N
deed04e7-fd9c-44e4-84f3-2cd88bee2312	8d19620f-8744-4f69-8bd7-45829a2df5c2	ES	IPD	ES*IPD*Edeed04e7	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "83d9113f-0885-4860-8217-5a5afe1f9ffe", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "37.3891", "longitude": "-5.9845"}	Zona D - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.222038+00	2025-09-03 11:05:20.898971+00	\N
6dc7c3f0-9740-4968-90c8-4fa0620b552c	a00c3eb2-0fa8-483f-963e-8b1d220be2aa	ES	IPD	ES*IPD*E6dc7c3f0	CHARGING	["RESERVABLE", "RFID_READER"]	[{"id": "073ed715-2c38-48be-8501-08cdf35db6ef", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "38.3452", "longitude": "-0.4945"}	Zona I - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.938535+00	2025-09-03 11:05:20.898971+00	\N
38d2cd26-f760-4234-8be5-ca1624e6cdcd	2a68c822-67d6-408b-9a86-ef782b65a3db	ES	IPD	ES*IPD*publish*747	AVAILABLE	["on","on","on","CHARGING_PROFILE_CAPABLE","REMOTE_START_STOP_CAPABLE"]	[{"id":"66a63c73-07e4-44b5-b356-8a753469e67e","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-01T20:20:52.722Z"},{"id":"39c299ac-94d7-4826-8d80-f3243d69daa2","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-01T20:20:52.722Z"}]	\N	\N	dormir	\N	\N	\N	2025-09-02 08:24:12.657+00	2025-09-01 20:20:52.767+00	2025-09-02 08:24:12.658+00	2025-09-02 08:24:12.657+00
e5d6a8c2-f735-481d-a0ab-9103f36049b9	2a68c822-67d6-408b-9a86-ef782b65a3db	ES	IPD	ES*IPD*publish*775	AVAILABLE	["CHARGING_PROFILE_CAPABLE","RFID_READER"]	[{"id":"cb3c1866-b0ce-4e4e-8705-b646118d07c5","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-02T09:11:50.984Z"},{"id":"62e38510-78af-4aa5-8b0a-47a9f9ab5f5b","standard":"CHAOJI","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-02T09:11:50.984Z"}]	\N	\N	solouno	\N	\N	\N	2025-09-02 09:12:18.279+00	2025-09-02 09:11:51.014+00	2025-09-02 09:12:18.279+00	2025-09-02 09:12:18.279+00
af048cf1-e85c-4b34-92f3-f5975a4ef0c2	2a68c822-67d6-408b-9a86-ef782b65a3db	ES	IPD	ES*IPD*publish*723	AVAILABLE	["CHARGING_PROFILE_CAPABLE","REMOTE_START_STOP_CAPABLE"]	[{"id":"49354284-3491-44fc-b281-fd50228fbb0f","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","voltage":230,"amperage":32,"max_power":null},{"id":"7284433f-dd64-477a-974c-7d021f182ef4","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","voltage":230,"amperage":32,"max_power":null}]	\N	\N	max2	\N	\N	\N	2025-09-02 08:56:37.26+00	2025-09-02 08:50:45.89+00	2025-09-02 08:56:37.26+00	2025-09-02 08:56:34.811+00
7ca514d0-18bc-448b-95b7-2aae079428d4	2a68c822-67d6-408b-9a86-ef782b65a3db	ES	IPD	ES*IPD*publish*127	AVAILABLE	["RESERVABLE"]	[{"id":"cb3c1866-b0ce-4e4e-8705-b646118d07c5","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","voltage":230,"amperage":32,"max_power":null}]	\N	\N	checks_edit	\N	\N	\N	2025-09-02 08:58:07.202+00	2025-09-02 08:56:57.88+00	2025-09-02 08:58:07.203+00	2025-09-02 08:57:47.427+00
f855c08b-7a03-4190-b9ec-60d71df7fc71	8d19620f-8744-4f69-8bd7-45829a2df5c2	ES	IPD	ES*IPD*Ef855c08b	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "d81078dd-7cfc-4e3f-8365-2ad33befd02f", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "37.3891", "longitude": "-5.9845"}	Zona D - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.222038+00	2025-09-03 11:05:20.898971+00	\N
75e0cc31-e209-486e-91a3-00911703cfd1	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000009	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"27590684-30b8-4239-922f-bd7ce5a7d1eb","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC9	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
129c661f-97ed-4046-b21d-f692f2a370c4	2a68c822-67d6-408b-9a86-ef782b65a3db	ES	IPD	ES*IPD*publish*787	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"cb3c1866-b0ce-4e4e-8705-b646118d07c5","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-02T08:59:10.084Z"},{"id":"c403b0a1-7f3e-437a-a630-fd6510330e2b","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-02T08:59:10.084Z"}]	\N	\N	otromas	\N	\N	\N	2025-09-02 09:11:37.218+00	2025-09-02 08:59:10.114+00	2025-09-02 09:11:37.218+00	2025-09-02 09:11:32.589+00
2a58add6-435d-4a39-8f00-0315525af3e5	a00c3eb2-0fa8-483f-963e-8b1d220be2aa	ES	IPD	ES*IPD*E2a58add6	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "6fad30ab-1f3b-4082-b0fa-40f3db07159a", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "38.3452", "longitude": "-0.4945"}	Zona I - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.938535+00	2025-09-03 11:05:20.898971+00	\N
987746b8-6993-4aff-88f7-808bcd6572b5	a00c3eb2-0fa8-483f-963e-8b1d220be2aa	ES	IPD	ES*IPD*E987746b8	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "0a3631e3-98df-4beb-b5d2-4686e3ac3ef5", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "38.3452", "longitude": "-0.4945"}	Zona I - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.938535+00	2025-09-03 11:05:20.898971+00	\N
80c2a589-919a-46b6-82aa-6c547eb09a97	2a68c822-67d6-408b-9a86-ef782b65a3db	ES	IPD	ES*IPD*publish*314	AVAILABLE	["CHARGING_PROFILE_CAPABLE","RFID_READER"]	[{"id":"88bf144f-6bdb-48eb-8cb0-287b35796a47","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":null,"tariff_ids":["60ed111e-685a-4546-b516-35e5332cc263"],"last_updated":"2025-09-03T08:53:11.669Z"}]	\N	\N	ad23	\N	\N	\N	2025-09-03 10:37:04.21+00	2025-09-02 09:12:39.056+00	2025-09-03 10:37:04.21+00	2025-09-03 10:33:17.86+00
fc090a11-ec76-4bcd-8699-0f4a1bb92b7b	350cb15c-b542-4191-a93b-3008054cc407	ES	IPD	ES*IPD*Efc090a11	AVAILABLE	["REMOTE_START_STOP_CAPABLE","RFID_READER"]	[{"id":"b9588185-43ad-4a57-a14c-71e118c129c2","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":["14ed4eb6-b854-4611-a1c0-8d9f8b0d81f9"],"last_updated":"2025-09-05T10:33:38.921Z"}]	\N	\N	exam	\N	\N	\N	2025-09-08 06:31:33.825+00	2025-09-05 06:59:19.183+00	2025-09-08 06:31:33.825+00	\N
f447335f-aa0c-44e7-9e8c-297d433d1b20	697918ae-f065-4d76-8259-49b4ac8f9ad3	ES	IPD	ES*IPD*Ef447335f	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "110d9f9c-1bdc-493c-abbc-25a6fe883b96", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "41.3851", "longitude": "2.1734"}	Zona B - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.216546+00	2025-09-03 11:05:20.898971+00	\N
f6d8af5f-6edf-4725-8bb8-a862d23fe594	697918ae-f065-4d76-8259-49b4ac8f9ad3	ES	IPD	ES*IPD*Ef6d8af5f	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "edd0a057-721c-43f9-8c75-bda5492de9ad", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "41.3851", "longitude": "2.1734"}	Zona B - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.216546+00	2025-09-03 11:05:20.898971+00	\N
a05d1471-d7b7-4448-bd78-ab401f9af025	0988de25-ce61-4e75-8663-1117dbe2e6b4	ES	IPD	ES*IPD*Ea05d1471	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "05150bf7-7dc6-4f4b-9ad3-baad2a5c8e25", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "43.2627", "longitude": "-2.9253"}	Zona E - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.926136+00	2025-09-03 11:05:20.898971+00	\N
9f049c78-40ec-4516-bd10-f57f2bd26a91	697918ae-f065-4d76-8259-49b4ac8f9ad3	ES	IPD	ES*IPD*E9f049c78	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "3d6b80b9-b071-454a-a6c6-418d9a0297f0", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "41.3851", "longitude": "2.1734"}	Zona B - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.216546+00	2025-09-03 11:05:20.898971+00	\N
0ee12a14-87e6-4850-b92a-812d4db454b4	a00c3eb2-0fa8-483f-963e-8b1d220be2aa	ES	IPD	ES*IPD*E0ee12a14	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "4c688a7b-af5f-4459-8b8c-d99850a7d185", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "38.3452", "longitude": "-0.4945"}	Zona I - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.938535+00	2025-09-03 11:05:20.898971+00	\N
37f5e053-b3fb-42b6-9e66-698e835902d4	697918ae-f065-4d76-8259-49b4ac8f9ad3	ES	IPD	ES*IPD*E37f5e053	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "1cb2a496-9996-4030-ad2d-c2615dab19e6", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "41.3851", "longitude": "2.1734"}	Zona B - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.216546+00	2025-09-03 11:05:20.898971+00	\N
0a924c81-2c7a-47c8-bfa5-204070a24606	0988de25-ce61-4e75-8663-1117dbe2e6b4	ES	IPD	ES*IPD*E0a924c81	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "2eef6f33-98c0-454f-aed2-1d7b8073b9e8", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "43.2627", "longitude": "-2.9253"}	Zona E - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.926136+00	2025-09-03 11:05:20.898971+00	\N
261b7c1a-afb2-464c-8e2e-3113ccd7d40a	0c94bd04-4cb9-46b8-bd06-58902c06ea3d	ES	IPD	ES*IPD*E261b7c1a	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "7baccf5a-4a66-4e4e-be4c-f0689bdfc297", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "37.1765", "longitude": "-3.5976"}	Zona H - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.937763+00	2025-09-03 11:05:20.898971+00	\N
f1112faa-d67a-4917-859b-86b868388a4f	2a68c822-67d6-408b-9a86-ef782b65a3db	ES	IPD	ES*IPD*publish*168	REMOVED	["CHARGING_PROFILE_CAPABLE"]	[{"id":"609fa019-3b17-4145-995a-a17df72a7606","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":null,"tariff_ids":[],"last_updated":"2025-09-03T10:49:54.995Z"}]	\N	\N	bug	\N	\N	\N	2025-09-03 10:50:04.34+00	2025-09-03 10:16:50.286+00	2025-09-03 10:50:04.341+00	2025-09-03 10:49:58.517+00
f0ad61ab-be3c-4c81-b2d1-deeaaa2f5294	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000010	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"49d52dbd-30e6-4c7f-8c8c-5e42173f36a8","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC10	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
f309e72f-f634-4f95-bb39-0acd04d05d56	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000013	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"b7e72e09-3c5b-4630-a50a-6f27bcc1ca3d","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC13	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
788fecce-88e2-4acf-9ea1-d5099955841e	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000014	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"d769b29e-4a85-4286-a60c-1a912147a855","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC14	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
6f16b776-e65b-44d8-9110-0e13816bbe6a	2a68c822-67d6-408b-9a86-ef782b65a3db	ES	IPD	ES*IPD*publish*565	AVAILABLE	["CHARGING_PROFILE_CAPABLE"]	[{"id":"49354284-3491-44fc-b281-fd50228fbb0f","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","voltage":230,"amperage":32,"max_power":1}]	\N	\N	hoy_edit3	\N	\N	\N	2025-09-03 09:02:17.787+00	2025-09-02 08:24:46.212+00	2025-09-03 09:02:17.787+00	2025-09-02 08:50:12.127+00
9d38d319-d7d9-4353-9e2d-02896a6b4e5a	2a68c822-67d6-408b-9a86-ef782b65a3db	ES	IPD	ES*IPD*publish*254	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"cb3c1866-b0ce-4e4e-8705-b646118d07c5","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-02T08:58:07.925Z"},{"id":"c311577b-cc19-4b79-9337-72872a8ec69f","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-02T08:58:07.925Z"}]	\N	\N	otro	\N	\N	\N	2025-09-03 09:02:18.063+00	2025-09-02 08:58:07.957+00	2025-09-03 09:02:18.063+00	2025-09-02 08:58:37.281+00
7e813696-684a-4bc6-8d5b-29d965aa067c	2a68c822-67d6-408b-9a86-ef782b65a3db	ES	IPD	ES*IPD*E39c25441	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"609fa019-3b17-4145-995a-a17df72a7606","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-03T10:50:24.689Z"},{"id":"a7cca463-63f1-4bc1-8143-7cf56473410c","standard":"CHADEMO","format":"SOCKET","power_type":"AC_1_PHASE","max_voltage":230,"max_amperage":32,"max_electric_power":7360,"tariff_ids":[],"last_updated":"2025-09-03T10:50:24.689Z"}]	\N	\N	bugok	\N	\N	\N	2025-09-03 11:11:40.973+00	2025-09-03 10:50:24.715+00	2025-09-03 11:11:40.974+00	2025-09-03 11:11:40.973+00
5604996e-7596-4dcd-84eb-89295c9de408	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000017	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"9e216d0e-9c34-45b1-9e4a-dd29cdafce06","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC17	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
6bab1905-8c2f-47be-bcd4-c67f314575c5	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000018	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"fa04ffec-082d-42c3-bfef-4d58c6ba81a5","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC18	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
7fdb79eb-c750-4c6c-a270-956114976010	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000005	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"012ea589-b647-4a6f-8382-69889cfb853e","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC5	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
45676629-a54f-40d0-a264-9428f0f0edc3	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000002	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"a0113fc4-dd06-4ea2-a130-d4bb410d70e9","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC2	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
f68cccdb-17bf-41a3-9408-d264b5a8cc4c	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000001	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"1833274c-8e3c-4a96-9ca5-63d910cd14d3","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC1	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
a6dcd3ff-5e85-4f0f-a419-82ef71c777de	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000003	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"76255295-d293-45e8-ad3f-0a7fff1bc85e","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC3	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
a1844a26-2e80-42ba-aa35-5607c567e780	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000021	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"75a8954b-0e08-4804-b599-815bd298ea4c","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC21	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
b4c387a9-50b2-4856-9ade-fff65461867c	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000022	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"044ee601-27f4-402d-9d81-83ed491d46f4","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC22	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
c19f5395-23c8-4ef9-a42a-43c9aa00aa3a	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000025	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"af65d668-8d29-4de1-a388-ae53dcceed23","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC25	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
a74077cc-161a-43a0-977d-5ef6a642d248	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000026	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"40848fe8-c673-4a78-8f9a-bd6fbec0bca1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC26	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
4034f915-7782-4339-a533-f0d63b90d46f	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000029	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"072d78ae-9ec4-4409-bb03-7aa404559533","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC29	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
31030438-bb2a-49c5-a2a7-6322383f6c47	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000030	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"6c9198d0-3b6f-440a-8a5b-b86d6a253679","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC30	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
22811b88-9b8f-4070-ae82-06134195659d	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000033	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"d9762115-93a7-4480-b97d-c94d8fb795e7","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC33	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
f5323c1b-c681-4223-9447-ce17561d6819	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000034	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"60a2fb67-478a-4fd7-9016-bc4c004fe736","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC34	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
78c516d7-911e-4982-8034-6ca802be34ca	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000037	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"dedb0689-63a1-4aac-a974-1220366d39b4","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC37	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
0553e7a2-74aa-4bf1-a699-0a7140898265	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000038	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"0fd4c936-bfcf-4c55-99f8-f753bd5d880f","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC38	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
01fec2a1-d4bd-459a-95f6-9181c93280c5	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000041	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"a71b5eea-0e50-4f86-8d69-e71d3ec96d58","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC41	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
b4134a90-0195-412f-9de0-27473b23f68b	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000042	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"e4836f32-7388-4b29-b632-89523d0a2f26","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC42	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
372b4815-6474-4845-9e49-e546ffb2b33d	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000045	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"05fb3a0f-f88f-49d1-a6c5-fdae0a51c480","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC45	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
797abeb9-f527-42e5-87cd-43299a7f1f1c	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000046	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"e7651864-7c00-464c-a05d-82080e664007","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC46	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
26650b7a-815a-43ff-87a2-01d68a598e90	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000049	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"61b1661f-7ef1-406d-a51d-581318995ae9","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC49	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
8530acbd-795b-4b66-a667-5be86166848d	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000050	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"8f3d47e3-8a67-479d-ac93-b72ed7c5ebad","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC50	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
98c4f8f8-6524-4257-b7fe-553bce42c2b7	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000053	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"1040b9c0-18a1-4e60-96e2-3d3e2d4f1f3e","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC53	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
5b91513b-4e92-4390-b3da-029f03d7bfbb	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000054	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"568ea7cf-1f43-4f5f-9f83-0ba11a3cce8e","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC54	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
12dc7b0a-df71-429a-ba06-13ed40d1c0f8	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000057	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"c0682bcf-efe9-460c-a217-2d4786175e47","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC57	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
cdc2cac4-6d8d-457a-884f-b716abb3862f	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000058	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"14ec035e-0057-4b21-90b8-9cde082f7114","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC58	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
22b33bdb-cb5b-4df2-9365-51da11d06049	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000061	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"64e734f2-2cf6-49f9-9565-deebbc2176df","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC61	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
152b9e03-7b2a-413a-a873-94cbf4b37c4b	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000062	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"21cdb727-3d9c-497f-94f9-06df40ee1e26","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC62	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
e264f530-6275-4eb6-9083-55fd7311a6a8	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000065	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"3677fc2e-5182-4a47-a7b8-1c38cdeaf950","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC65	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
426b55ff-743a-4537-a97d-3d41e58f4d7e	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000066	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"1e44dd25-84c2-4caf-b67e-d9ae8aba6297","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC66	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
7210651a-6226-4e22-8d1f-022014cbd19c	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000069	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"46a9c399-af91-4907-80f4-e41ebc7d1535","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC69	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
84ae75a6-7bf4-4b2d-9eda-fa33a19b5fc4	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000070	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"6bb9d4dd-8c65-4767-b460-ec203a071029","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC70	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
a76ff002-43a9-4638-9663-01ade8473474	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000073	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"9ebd8884-0be9-4cfe-8deb-2e71f58b2430","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC73	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
8baa2e98-53a0-49c6-b843-6921ff0aeeb3	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000074	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"6099f938-2213-4ef6-9be2-97383a8d982f","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC74	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
9eebff93-0b00-4f8a-9443-0a6cddbae22e	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000077	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"80efa496-7214-4d19-91af-f6f42fd51d41","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC77	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
aa56db6d-a79e-46cf-adb1-545c587643af	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000078	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"74d8fa48-e739-44d6-b5a9-cc46381863c8","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC78	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
edf15994-f62e-4681-8ead-15cae327651a	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000081	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"0c7c9800-5b92-4e0c-ab97-3d754cd5fd70","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC81	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
b09b499a-fed8-4262-aa88-e2c00c5ba36e	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000082	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"95a3cf79-ad8e-4a03-b612-59d05b584ad6","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC82	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
a1c9ac7f-243b-40aa-90dd-6bdb90d50d59	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000085	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"293a858a-33d5-4c95-b162-5c433a978830","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC85	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
09112a07-294b-4433-9a37-1d6b4d12eacf	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000086	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"5bb0ab2f-4cd4-4500-98f1-7ddfcd2d5d12","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC86	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
cba7221f-ebde-418d-b368-d4e243b3434f	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000089	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"8de69209-e471-4e4b-bdc5-6c8eba95dc9b","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC89	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
42d63571-be13-4a90-887e-7abf24179e36	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000090	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"fe11d343-9a04-4a48-9180-2f9993b2f7e4","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC90	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
fd2e1cdf-a02e-4786-97d1-fe912fcd0b27	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000093	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"fd1e4c07-35bb-400c-869c-e746b7e9fc2d","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC93	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
5af4cadb-5c98-4a97-b21c-fe3d651584e2	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000094	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"c6e7f241-a811-4c56-a11d-a9d1967736d7","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC94	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
e4c4a689-4b87-4845-9551-94a8226065aa	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	ES*IPD*E00000097	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"341fb0fd-e6bb-4eaa-8a56-0b1a9c957275","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC97	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
1ca4acdc-08f5-4752-b1d7-14dafc26c91d	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	ES*IPD*E00000098	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"6f73a247-e1d6-4c58-a373-a38742d11ef8","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC98	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
726b1c68-c2db-4c6a-8772-bb432697742c	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000004	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"2da00c22-360b-455a-80fb-5de7005c2d0a","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC4	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
079a9a96-facc-4308-985f-737ad92e1b57	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000007	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"33746b30-1f15-47bc-a262-af4b06dc3725","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC7	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
237fd773-6b82-426d-9ba4-8a0ad1b6e3d7	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000008	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"73727011-ad47-49af-8e4a-d9343a8eba7c","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC8	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
e9142290-c35c-4ed0-8423-766d42b38d7a	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000011	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"75d70329-46dd-4306-afe6-b364406450bd","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC11	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
d1e3472c-358f-4576-9a31-d74eb3b265ab	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000012	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"3418d7db-e27e-4aab-91c8-524f0d7f810b","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC12	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
f81927a4-48fe-45db-911b-564a50e3bcc4	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000015	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"54a2e972-d682-4607-b090-b1b6e36c3546","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC15	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
36418309-e2e1-4682-b64b-067adaa23e5d	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000016	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"e036db85-47d7-400b-9c55-8f63c7cfbb06","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC16	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
3eb58541-066a-40a6-aed4-05f54c4303d0	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000019	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"2d94d144-c79d-4cfd-88fe-ef7ecb951fc2","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC19	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
92215adb-2200-4060-9c20-4743d7dfd409	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000020	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"51bd33d2-1316-4950-a51e-e3c346205b2d","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC20	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
127c3b85-da24-462c-8f22-afd79b7df704	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000023	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"1cb6b2fd-a2d0-48fc-b324-57bd876cbbe6","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC23	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
606ae632-ab71-42d3-9a9f-ae7a8a8ee859	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000024	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"4bfdcdac-3322-43ae-8c3a-a929878f5908","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC24	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
353c1dbd-48ac-4939-96f6-9623b5fe72b7	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000027	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"06a5b50e-c37a-4de8-837c-50bb7e01b98b","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC27	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
543606af-96bd-4f3a-ad1a-55191e522e8c	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000028	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"09a8d92b-eae8-44bc-998b-f54a71e2897a","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC28	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
c46ffd32-4f15-4acc-983d-b68a1933a6b9	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000031	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"ffbd81fe-c47f-4b0b-ade4-9e485595f03d","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC31	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
1f3df7ff-b039-43c3-8f13-6e726e88eda0	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000032	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"5ba81732-f33a-4228-957a-ee9151a476b9","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC32	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
62bb68cd-89ab-4a51-8df9-9258700e7d80	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000035	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"3fa54175-c895-411f-94fc-afa108974306","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC35	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
9cb18805-f448-48df-baa4-5bbf02d021d6	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000036	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"03d21b10-fa66-4973-a116-559ed9688219","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC36	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
eef6d362-ae53-47fa-967c-aaaf1250c62c	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000039	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"781c9e0c-d5f1-45c5-8d10-e5d5cd4157ec","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC39	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
77ddd03d-862a-4fc6-a48b-b944d98b701f	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000040	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"c9936aef-d9dd-497f-8a68-163727996833","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC40	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
f6c0f6b6-c1b9-4820-a1be-344d10f1c4d2	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000043	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"23d03c40-e44f-42a1-be57-528f0c56bd42","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC43	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
a30c7ca3-6a4b-4051-9ae7-7739b63846ee	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000044	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"78656a56-6eef-4142-93fc-14588e1078b4","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC44	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
6c976bd9-65f4-4156-b6a5-275e9e0e9cf5	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000047	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"c504f32f-dd40-44ad-9b48-fc57839713e5","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC47	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
d481d280-2a3f-45b8-830e-30b33a8c3210	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000048	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"dd844295-14b7-4a3b-a1ba-6a7941cfb68e","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC48	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
d5a5b2b6-6606-4d1b-b482-10b75bd7638d	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000051	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"bff8923c-f470-4f53-903b-2efcbc98491e","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC51	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
981b9d9f-11a2-464f-a41a-1cbcfeb975af	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000052	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"438198af-1aae-4fc9-aa36-b264d9944019","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC52	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
156597c1-c3d1-4748-a3fd-edeb982b9635	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000055	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"5f0b544c-7a87-4ab1-bfd9-1909d1c32cf6","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC55	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
6d26b572-a9d8-4654-89d6-b188d5e0f7a7	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000056	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"90f7e670-b92e-40c9-b789-9fa00a535d1f","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC56	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
08ce3dac-4ae1-4fd9-af32-bc08cb096e50	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000059	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"ab8bc2c0-b051-48cb-8f00-d4597c8670d7","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC59	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
710aa01b-e357-43fa-b619-193914c0c572	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000060	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"680b1bb3-3ef6-4566-9b39-3754afeddd4d","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC60	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
04deebbb-499b-43e8-bbe9-b77381fd67c2	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000063	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"30b193d4-09ef-40e4-971a-aa56a9d70548","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC63	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
33029de5-b834-4c24-8eb6-73d0e3e494de	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000064	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"fbf30b53-e7fe-456e-b0c8-1e4a6f22aefe","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC64	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
f6772581-8f9d-473e-8b91-a7e2caa275d8	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000067	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"fb1cf5c6-ebff-4c38-a9b8-1f8a4bd7d952","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC67	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
50e03a2b-f5f4-42d5-ae16-1b7dcbca92ec	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000068	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"546c004f-672e-4f3c-a176-d7f08dacabf9","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC68	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
da4939b9-8eca-47ab-bf85-9278922709cc	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000071	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"a078f690-f78a-4777-ae9c-1a6a8fb2d914","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC71	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
8c079a5c-a35f-45aa-a837-933c5277c42f	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000072	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"1baf739b-c294-40c0-baf9-03fe4199bee1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC72	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
e67d7020-29c7-44e4-970f-26ef5808861b	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000075	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"c9d1e492-2e38-4691-b881-e15c3892f3fb","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC75	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
01452be4-e825-4b44-bc12-8cbbe1c0c481	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000076	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"ee60a517-5757-4944-8548-f29c906ab54a","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC76	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
b846d51a-af56-446b-8a79-b9e0516d26f1	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000079	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"d863e2c3-ce28-478d-b75b-42220e033ad1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC79	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
b33f1b4e-fbbb-4a30-b886-fbe9161aacd2	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000080	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"ccfd7c2b-bb20-40c4-b3a7-498ff9aff9bc","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC80	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
bef91273-3398-44df-9134-d02f88381788	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000083	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"bf539c25-c771-4d8d-8780-fb2bd02f6f0a","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC83	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
fe48c33a-bbb4-4e28-a97d-8006fd24d9cb	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000084	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"39dc053b-00c7-4cda-beef-cdcd10c9f087","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC84	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
d0900a72-97fd-4570-befc-758f83b22236	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000087	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"cf3e10c0-986e-41ed-b2a7-4cbc8854eee4","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC87	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
40bc1520-92f6-424c-9035-8769dd3f8a25	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000088	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"4e1ccf03-da22-443f-ad07-ca34d64cedb5","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC88	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
589075f9-528c-4be8-be2c-1f62fe402ab9	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000091	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"c5204640-4eb9-47d0-9585-5ac74e6823f5","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC91	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
66392e41-2b1f-4934-8873-fcbbd5675a7d	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000092	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"f4022dca-effe-4041-a46c-7164560fed2c","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC92	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
645a5576-94c5-4813-8b5d-90e7e0107d72	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000095	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"efc1b673-d43e-4f9e-bf98-2bc38f3c2ab0","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC95	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
8745ff3a-4252-4981-9955-cda3ae6cf078	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000096	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"2f6d40b9-2527-4dd2-a5c3-414cfad22a62","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC96	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
28cece0a-6649-438f-8ffe-07810b072699	8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	ES*IPD*E00000099	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"9831cba6-006b-4401-b3d2-114913ef6483","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC99	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
39b37204-abf9-4aad-a49c-8486e335260f	c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	ES*IPD*E00000100	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"5dec8de6-d299-471c-99ba-5730ed6a8643","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC100	\N	\N	\N	2025-09-03 11:05:13.03508+00	2025-08-26 12:47:51.876+00	2025-09-03 11:05:13.03508+00	\N
8872c93d-5129-49d9-80fe-4d864d269e60	ff2daf54-5ac6-441f-9b4b-4c715e66d12e	ES	IPD	ES*IPD*E8872c93d	CHARGING	["RESERVABLE", "RFID_READER"]	[{"id": "45d676c6-da31-4de9-ad69-e20d465290ff", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "40.4168", "longitude": "-3.7038"}	Zona A - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.201836+00	2025-09-03 11:05:20.898971+00	\N
660b09a1-75db-4a26-b589-0552af31f9b7	c7f1faa4-25cc-48dc-afec-e4747dc2ea49	ES	IPD	ES*IPD*E660b09a1	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "b25c8af0-7923-478c-a576-86a066126a38", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "36.7213", "longitude": "-4.4217"}	Zona F - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.935761+00	2025-09-03 11:05:20.898971+00	\N
f04a9ba5-2970-4833-a82b-fdcaf62c15f1	8d19620f-8744-4f69-8bd7-45829a2df5c2	ES	IPD	ES*IPD*Ef04a9ba5	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "99c0fcd6-f63d-456c-abc1-388faa2f24a3", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "37.3891", "longitude": "-5.9845"}	Zona D - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.222038+00	2025-09-03 11:05:20.898971+00	\N
7fe3b955-2eb1-4ee1-8b74-304205dbcee8	0988de25-ce61-4e75-8663-1117dbe2e6b4	ES	IPD	ES*IPD*E7fe3b955	CHARGING	["RESERVABLE", "RFID_READER"]	[{"id": "5508c8eb-6392-4c75-9145-a4c069711045", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "43.2627", "longitude": "-2.9253"}	Zona E - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.926136+00	2025-09-03 11:05:20.898971+00	\N
a785e24c-b78e-4216-b03a-a526eaac8195	ff2daf54-5ac6-441f-9b4b-4c715e66d12e	ES	IPD	ES*IPD*Ea785e24c	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "a07f5ad8-d28a-4a49-a898-166beb37c1c0", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "40.4168", "longitude": "-3.7038"}	Zona A - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.201836+00	2025-09-03 11:05:20.898971+00	\N
c412a52e-3bfb-4e3c-89c1-1ddea04ea514	c7f1faa4-25cc-48dc-afec-e4747dc2ea49	ES	IPD	ES*IPD*Ec412a52e	CHARGING	["RESERVABLE", "RFID_READER"]	[{"id": "867da146-e10f-46a7-b08d-1b47b90a41c7", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "36.7213", "longitude": "-4.4217"}	Zona F - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.935761+00	2025-09-03 11:05:20.898971+00	\N
02d79a17-255b-45dd-952a-a27bd4c81c00	0988de25-ce61-4e75-8663-1117dbe2e6b4	ES	IPD	ES*IPD*E02d79a17	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "4eb0468b-a4ce-4a13-b4ce-a629a973da32", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "43.2627", "longitude": "-2.9253"}	Zona E - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.926136+00	2025-09-03 11:05:20.898971+00	\N
885bcf7f-055b-46a5-a9d3-786496d312f2	0988de25-ce61-4e75-8663-1117dbe2e6b4	ES	IPD	ES*IPD*E885bcf7f	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "3ad7333d-e11d-414e-836e-00aaa4efa0ac", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "43.2627", "longitude": "-2.9253"}	Zona E - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.926136+00	2025-09-03 11:05:20.898971+00	\N
d7145de2-bb38-4eb2-a2b1-65a560e3c0bc	0988de25-ce61-4e75-8663-1117dbe2e6b4	ES	IPD	ES*IPD*Ed7145de2	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "b061298c-0366-44bb-b608-5f9bc6861799", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "43.2627", "longitude": "-2.9253"}	Zona E - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.926136+00	2025-09-03 11:05:20.898971+00	\N
65668b04-f2a3-4a29-bb29-5a55b1840413	0c94bd04-4cb9-46b8-bd06-58902c06ea3d	ES	IPD	ES*IPD*E65668b04	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "6a966073-1400-4549-8651-0b700b2028bb", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "37.1765", "longitude": "-3.5976"}	Zona H - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.937763+00	2025-09-03 11:05:20.898971+00	\N
d1e994c9-7597-4917-9e9f-56378f0318ef	ff2daf54-5ac6-441f-9b4b-4c715e66d12e	ES	IPD	ES*IPD*Ed1e994c9	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "9b629095-4605-416b-925d-6b7299be5f51", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "40.4168", "longitude": "-3.7038"}	Zona A - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.201836+00	2025-09-03 11:05:20.898971+00	\N
90e08691-59dc-400f-ba95-5cca74f2e99a	c7f1faa4-25cc-48dc-afec-e4747dc2ea49	ES	IPD	ES*IPD*E90e08691	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "fcf3cdbc-a41e-46ad-870c-5d69f3db9fd1", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "36.7213", "longitude": "-4.4217"}	Zona F - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.935761+00	2025-09-03 11:05:20.898971+00	\N
37ad1140-0139-4d42-a3af-2a69eb9ed3d7	9295ed6c-4c93-4cbc-b687-abee02d29bdf	ES	IPD	ES*IPD*E37ad1140	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "2842cfc4-90d6-4606-812a-2e89bd3560fd", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "39.4699", "longitude": "-0.3763"}	Zona C - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.219712+00	2025-09-03 11:05:20.898971+00	\N
ee3a03f7-dfea-4794-9756-4dfce67554a9	9295ed6c-4c93-4cbc-b687-abee02d29bdf	ES	IPD	ES*IPD*Eee3a03f7	CHARGING	["RESERVABLE", "RFID_READER"]	[{"id": "445d2000-d5b5-4096-a0ab-fc5c660ee2d1", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "39.4699", "longitude": "-0.3763"}	Zona C - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.219712+00	2025-09-03 11:05:20.898971+00	\N
bfb96191-a77a-4c0e-abdf-41fccf8fda0a	9295ed6c-4c93-4cbc-b687-abee02d29bdf	ES	IPD	ES*IPD*Ebfb96191	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "90790106-857a-4685-b4d5-ecd25db3cb83", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "39.4699", "longitude": "-0.3763"}	Zona C - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.219712+00	2025-09-03 11:05:20.898971+00	\N
c06d45f3-d32e-4a1c-b414-1cecb5d423d8	9295ed6c-4c93-4cbc-b687-abee02d29bdf	ES	IPD	ES*IPD*Ec06d45f3	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "11e74999-3fce-4808-ab4c-565c2a6515f9", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "39.4699", "longitude": "-0.3763"}	Zona C - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.219712+00	2025-09-03 11:05:20.898971+00	\N
d333c0f1-5f43-438e-96a2-a16f65ac6b0a	9295ed6c-4c93-4cbc-b687-abee02d29bdf	ES	IPD	ES*IPD*Ed333c0f1	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "cf31809e-a6cc-4530-969d-114d8c0422b0", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "39.4699", "longitude": "-0.3763"}	Zona C - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.219712+00	2025-09-03 11:05:20.898971+00	\N
dcd6949e-4546-45f4-ac5c-4b8ce8696163	9295ed6c-4c93-4cbc-b687-abee02d29bdf	ES	IPD	ES*IPD*Edcd6949e	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "07767702-fc96-4718-ad5d-024d6984d039", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "39.4699", "longitude": "-0.3763"}	Zona C - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:22.219712+00	2025-09-03 11:05:20.898971+00	\N
66d8af35-90c7-4624-9d99-77a0945d6f58	6a5b4601-2952-4a5f-afa2-60890dc278f2	ES	IPD	ES*IPD*E66d8af35	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "93eb2ddd-00e0-4630-87c1-1a4d69ade154", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "41.6523", "longitude": "-4.7284"}	Zona J - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.939262+00	2025-09-03 11:05:20.898971+00	\N
4ef49f84-03b7-4536-89e4-d977ecdeb3c3	6a5b4601-2952-4a5f-afa2-60890dc278f2	ES	IPD	ES*IPD*E4ef49f84	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "2ab46a61-270f-4900-a705-b4e746a1704d", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "41.6523", "longitude": "-4.7284"}	Zona J - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.939262+00	2025-09-03 11:05:20.898971+00	\N
332d5f21-2a9b-4e71-9bbe-ab16ec06b48e	a00c3eb2-0fa8-483f-963e-8b1d220be2aa	ES	IPD	ES*IPD*E332d5f21	AVAILABLE	[\n  "RESERVABLE",\n  "REMOTE_START_STOP_CAPABLE"\n]	[{"id": "0202739e-06ac-41d5-8e54-013ee7ca027b", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "38.3452", "longitude": "-0.4945"}	Zona I - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.938535+00	2025-09-03 11:05:20.898971+00	\N
f0c8b24c-3cb5-4662-83c5-31bd16756fd1	23b2e2ac-ba1a-46a5-9906-a9c893d92e87	ES	IPD	ES*IPD*Ef0c8b24c	AVAILABLE	[\n  "RESERVABLE",\n  "REMOTE_START_STOP_CAPABLE"\n]	[{"id": "079d31e7-bf1d-45cd-a603-5926a54217c7", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "41.6488", "longitude": "-0.8891"}	Zona G - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.936893+00	2025-09-03 11:05:20.898971+00	\N
1d70ff2b-c2c4-4da4-8893-1e8f01f15805	23b2e2ac-ba1a-46a5-9906-a9c893d92e87	ES	IPD	ES*IPD*E1d70ff2b	AVAILABLE	[\n  "RESERVABLE",\n  "REMOTE_START_STOP_CAPABLE"\n]	[{"id": "de55225a-8e19-4dfb-81db-c330f9caccd8", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "41.6488", "longitude": "-0.8891"}	Zona G - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.936893+00	2025-09-03 11:05:20.898971+00	\N
915c2b19-fd5b-411a-b1ea-583cd7753f4d	23b2e2ac-ba1a-46a5-9906-a9c893d92e87	ES	IPD	ES*IPD*E915c2b19	CHARGING	[\n  "RESERVABLE",\n  "REMOTE_START_STOP_CAPABLE"\n]	[{"id": "8c0124fa-7d1f-43ec-8340-d6c3696a53ea", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "41.6488", "longitude": "-0.8891"}	Zona G - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.936893+00	2025-09-03 11:05:20.898971+00	\N
cc376934-69c2-4320-b50d-82e3852d1661	23b2e2ac-ba1a-46a5-9906-a9c893d92e87	ES	IPD	ES*IPD*Ecc376934	AVAILABLE	[\n  "RESERVABLE",\n  "REMOTE_START_STOP_CAPABLE"\n]	[{"id": "d3c76141-b236-4755-8d9c-a1ff75eab739", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "41.6488", "longitude": "-0.8891"}	Zona G - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.936893+00	2025-09-03 11:05:20.898971+00	\N
091e1182-896d-4562-ae22-71346368e3bf	23b2e2ac-ba1a-46a5-9906-a9c893d92e87	ES	IPD	ES*IPD*E091e1182	AVAILABLE	[\n  "RESERVABLE",\n  "REMOTE_START_STOP_CAPABLE"\n]	[{"id": "0e729004-300d-4a5f-a40f-38c828c253af", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "41.6488", "longitude": "-0.8891"}	Zona G - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.936893+00	2025-09-03 11:05:20.898971+00	\N
3b1b915e-d83a-4e57-b4c4-d22a6e0d70e9	6a5b4601-2952-4a5f-afa2-60890dc278f2	ES	IPD	ES*IPD*E3b1b915e	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "0f4966f4-9ed8-426d-bc9f-b9b555193c40", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "41.6523", "longitude": "-4.7284"}	Zona J - Nivel 0	\N	\N	\N	2025-09-03 11:05:20.898971+00	2025-09-01 09:45:28.939262+00	2025-09-03 11:05:20.898971+00	\N
4cfd8f05-6d8b-4c13-8637-177c121a453a	6a5b4601-2952-4a5f-afa2-60890dc278f2	ES	IPD	ES*IPD*E4cfd8f05	AVAILABLE	["RESERVABLE", "RFID_READER"]	[{"id": "ff9f98f5-6335-4156-b2ab-a2f8cdce705c", "format": "SOCKET", "standard": "IEC_62196_T2", "power_type": "AC_3_PHASE", "max_voltage": 400, "max_amperage": 32, "max_electric_power": 22000}]	0	{"latitude": "41.6523", "longitude": "-4.7284"}	Zona J - Nivel 0	\N	\N	\N	2025-09-03 11:11:29.353+00	2025-09-01 09:45:28.939262+00	2025-09-03 11:11:29.354+00	\N
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.locations (id, country_code, party_id, name, address, city, postal_code, state, country, coordinates, related_locations, parking_type, evses, directions, operator, suboperator, owner, facilities, time_zone, opening_times, charging_when_closed, images, energy_mix, last_updated, publish, created_at, updated_at, deleted_at) FROM stdin;
f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	Centro Comercial Madrid	Calle Gran Vía 28	Madrid	28013	Madrid	ESP	{"latitude": 40.4168, "longitude": -3.7038}	[]	PARKING_GARAGE	[]	{}	{}	\N	{}	["RESTAURANT","SHOPPING","PARKING"]	Europe/Madrid	{}	t	[]	{}	2025-08-26 12:47:51.876+00	t	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	\N
64d71462-3097-4abf-a718-140d9205257c	ES	IPD	Estación de Servicio Barcelona	Avinguda Diagonal 123	Barcelona	08013	Barcelona	ESP	{"latitude": 41.3851, "longitude": 2.1734}	[]	ALONG_MOTORWAY	[]	{}	{}	\N	{}	["RESTAURANT","SHOP","RESTROOM"]	Europe/Madrid	{}	t	[]	{}	2025-08-26 12:47:51.876+00	t	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	\N
8ea3e1b5-d515-48e7-9763-332e8d81841f	ES	IPD	Centro Comercial Porto	Rua de Santa Catarina 123	Porto	4000-000	Porto	PRT	{"latitude": 41.1579, "longitude": -8.6291}	[]	PARKING_GARAGE	[]	{}	{}	\N	{}	["RESTAURANT","SHOPPING","PARKING"]	Europe/Lisbon	{}	t	[]	{}	2025-08-26 12:47:51.876+00	t	2025-08-26 12:47:51.876+00	2025-09-01 08:17:16.206088+00	\N
c212d574-c698-4e78-8175-121441bce3f6	ES	IPD	Estación de Servicio Lisboa	Avenida da República 45	Lisboa	1050-000	Lisboa	PRT	{"latitude": 38.7223, "longitude": -9.1393}	[]	ALONG_MOTORWAY	[]	{}	{}	\N	{}	["RESTAURANT","SHOP","RESTROOM"]	Europe/Lisbon	{}	t	[]	{}	2025-08-26 12:47:51.876+00	t	2025-08-26 12:47:51.876+00	2025-09-01 08:17:16.206088+00	\N
test-location-001	ES	IPD	Location de Prueba	Calle de Prueba 123	Madrid	\N	\N	ESP	{"latitude": 40.4168, "longitude": -3.7038}	\N	PARKING_GARAGE	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 14:06:43.091+00	t	2025-09-01 14:06:30.046+00	2025-09-01 14:06:43.091+00	2025-09-01 14:06:43.091+00
98c77c04-0b31-4232-a433-3f568fb26790	ES	IPD	borrar	borrar	borrar	57465	\N	ESP	{"latitude": 0.000001, "longitude": -0.000001}	\N	ON_STREET	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 14:08:14.063+00	t	2025-09-01 14:08:06.06+00	2025-09-01 14:08:14.064+00	2025-09-01 14:08:14.063+00
test-location-with-evses	ES	IPD	Location de Prueba con EVSEs	Calle de Prueba 123	Madrid	\N	\N	ESP	{"latitude": 40.4168, "longitude": -3.7038}	\N	\N	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 14:46:27.296+00	t	2025-09-01 14:44:51.759+00	2025-09-01 14:46:27.296+00	2025-09-01 14:46:27.296+00
test-location-notification	ES	IPD	Location para Notificación EMSP	Calle de Notificación 456	Barcelona	\N	\N	ESP	{"latitude": 41.3851, "longitude": 2.1734}	\N	\N	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 14:55:49.419+00	t	2025-09-01 14:52:39.323+00	2025-09-01 14:55:49.419+00	2025-09-01 14:55:49.419+00
56547430-64c0-4b7d-a266-fcf71bd2aecc	ES	IPD	manual	Avenida Palleiro 31 3ºB	manual	15140	\N	ESP	{"latitude": 0.000001, "longitude": -0.000001}	\N	ON_STREET	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 14:57:03.42+00	t	2025-09-01 14:28:00.909+00	2025-09-01 14:57:03.42+00	2025-09-01 14:57:03.42+00
a00c3eb2-0fa8-483f-963e-8b1d220be2aa	ES	IPD	Gran Vía - Estación de Carga	Avenida de Denia, 1	Alicante	03015	Alicante	ESP	{"latitude": "38.3452", "longitude": "-0.4945"}	\N	PARKING_GARAGE	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 09:41:40.827768+00	t	2025-09-01 09:41:40.827768+00	2025-09-01 09:41:40.827768+00	\N
697918ae-f065-4d76-8259-49b4ac8f9ad3	ES	IPD	Diagonal Mar - Estación de Carga	Passeig del Taulat, 262-264	Barcelona	08019	Barcelona	ESP	{"latitude": "41.3851", "longitude": "2.1734"}	\N	PARKING_GARAGE	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 09:41:40.819593+00	t	2025-09-01 09:41:40.819593+00	2025-09-01 09:41:40.819593+00	\N
0988de25-ce61-4e75-8663-1117dbe2e6b4	ES	IPD	Zubiarte - Estación de Carga	Paseo Campo Volantín, 23	Bilbao	48007	Vizcaya	ESP	{"latitude": "43.2627", "longitude": "-2.9253"}	\N	PARKING_GARAGE	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 09:41:40.823333+00	t	2025-09-01 09:41:40.823333+00	2025-09-01 09:41:40.823333+00	\N
0c94bd04-4cb9-46b8-bd06-58902c06ea3d	ES	IPD	Nevada - Estación de Carga	Avenida de la Constitución, 1	Granada	18012	Granada	ESP	{"latitude": "37.1765", "longitude": "-3.5976"}	\N	PARKING_GARAGE	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 09:41:40.82661+00	t	2025-09-01 09:41:40.82661+00	2025-09-01 09:41:40.82661+00	\N
ff2daf54-5ac6-441f-9b4b-4c715e66d12e	ES	IPD	Plaza Norte 2 - Estación de Carga	Calle de la Viña, 3	Madrid	28050	Madrid	ESP	{"latitude": "40.4168", "longitude": "-3.7038"}	\N	PARKING_GARAGE	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 09:41:40.81117+00	t	2025-09-01 09:41:40.81117+00	2025-09-01 09:41:40.81117+00	\N
c7f1faa4-25cc-48dc-afec-e4747dc2ea49	ES	IPD	Larios - Estación de Carga	Calle Larios, 1	Málaga	29005	Málaga	ESP	{"latitude": "36.7213", "longitude": "-4.4217"}	\N	PARKING_GARAGE	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 09:41:40.82434+00	t	2025-09-01 09:41:40.82434+00	2025-09-01 09:41:40.82434+00	\N
8d19620f-8744-4f69-8bd7-45829a2df5c2	ES	IPD	Plaza de Armas - Estación de Carga	Plaza de Armas, 1	Sevilla	41001	Sevilla	ESP	{"latitude": "37.3891", "longitude": "-5.9845"}	\N	PARKING_GARAGE	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 09:41:40.822187+00	t	2025-09-01 09:41:40.822187+00	2025-09-01 09:41:40.822187+00	\N
6a5b4601-2952-4a5f-afa2-60890dc278f2	ES	IPD	Vallsur - Estación de Carga	Paseo de Zorrilla, 1	Valladolid	47007	Valladolid	ESP	{"latitude": "41.6523", "longitude": "-4.7284"}	\N	PARKING_GARAGE	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 09:41:40.828789+00	t	2025-09-01 09:41:40.828789+00	2025-09-01 09:41:40.828789+00	\N
9295ed6c-4c93-4cbc-b687-abee02d29bdf	ES	IPD	Aqua Multiespacio - Estación de Carga	Carrer de Menorca, 19	Valencia	46023	Valencia	ESP	{"latitude": "39.4699", "longitude": "-0.3763"}	\N	PARKING_GARAGE	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 09:41:40.82087+00	t	2025-09-01 09:41:40.82087+00	2025-09-01 09:41:40.82087+00	\N
23b2e2ac-ba1a-46a5-9906-a9c893d92e87	ES	IPD	Puerto Venecia - Estación de Carga	Calle de las Fuentes, 1	Zaragoza	50018	Zaragoza	ESP	{"latitude": "41.6488", "longitude": "-0.8891"}	\N	PARKING_GARAGE	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 09:41:40.825354+00	t	2025-09-01 09:41:40.825354+00	2025-09-01 09:41:40.825354+00	\N
test-location-notification-2	ES	IPD	Location para Notificación EMSP 2	Calle de Notificación 789	Valencia	\N	\N	ESP	{"latitude": 39.4699, "longitude": -0.3763}	\N	\N	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 14:57:06.199+00	t	2025-09-01 14:53:34.304+00	2025-09-01 14:57:06.199+00	2025-09-01 14:57:06.199+00
21b84b80-755b-4504-adc2-861da087bbcb	ES	IPD	notificacion	notificacion	notificacion	77777	\N	ESP	{"latitude": 0.000001, "longitude": -0.000001}	\N	ON_STREET	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 15:33:41.759+00	t	2025-09-01 14:58:32.667+00	2025-09-01 15:33:41.76+00	2025-09-01 15:33:41.759+00
63dec17d-f852-4b40-b12c-bae264e791d8	ES	IPD	notificar	notificar	notificar	74587	\N	ESP	{"latitude": 0.000001, "longitude": -0.000001}	\N	ON_STREET	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 15:43:14.919+00	t	2025-09-01 15:34:37.729+00	2025-09-01 15:43:14.92+00	2025-09-01 15:43:14.919+00
accd2683-dded-4b56-8805-bb9299f0f22d	ES	IPD	not1	not1	not1	45689	\N	ESP	{"latitude": 0.000001, "longitude": -0.000001}	\N	ON_STREET	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 15:54:20.475+00	t	2025-09-01 15:46:55.301+00	2025-09-01 15:54:20.476+00	2025-09-01 15:54:20.475+00
682dd397-67f9-472c-af3a-f64d0b1af5cf	ES	IPD	not	not	not	74589	\N	ESP	{"latitude": 0.000001, "longitude": -0.000001}	\N	ON_STREET	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 15:54:40.714+00	t	2025-09-01 15:44:50.918+00	2025-09-01 15:54:40.715+00	2025-09-01 15:54:40.714+00
f62f8715-5e21-449a-afa0-94e1eec2e114	ES	IPD	ipd	ipd	ipd2	745896	\N	ESP	{"latitude": 0.000001, "longitude": -0.000001}	\N	ON_STREET	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 16:05:35.251+00	t	2025-09-01 15:55:01.923+00	2025-09-01 16:05:35.252+00	2025-09-01 16:05:35.251+00
5cf1b768-1c58-4a17-87aa-4c8b1283f0b9	ES	IPD	notifi	notifi	notifi	74589	\N	ESP	{"latitude": -0.000001, "longitude": -0.000001}	\N	ON_STREET	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 16:15:04.489+00	t	2025-09-01 16:06:02.032+00	2025-09-01 16:15:04.49+00	2025-09-01 16:15:04.489+00
3d8cf5e9-d2f3-4d25-8306-14a51c000033	ES	IPD	ahora	ahora	ahora66	74589	\N	ESP	{"latitude": 0.000001, "longitude": -0.000001}	\N	ON_STREET	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 17:45:29.368+00	t	2025-09-01 16:15:22.095+00	2025-09-01 17:45:29.369+00	2025-09-01 17:45:29.368+00
e99cf6e1-cc0a-4f1c-ba0f-b364fc94f0f7	ES	IPD	put	put	put7	74589	\N	ESP	{"latitude": 0.000001, "longitude": -0.000001}	\N	ON_STREET	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 18:14:31.618+00	t	2025-09-01 18:02:54.51+00	2025-09-01 18:14:31.618+00	2025-09-01 18:14:31.618+00
e47a4d09-5755-4df5-9ccb-49ebe340d00d	ES	IPD	ahorasi	ahorasi	ahorasi	74589	\N	ESP	{"latitude": 0.000001, "longitude": -0.000001}	\N	ON_STREET	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 18:18:38.054+00	t	2025-09-01 18:14:54.091+00	2025-09-01 18:18:38.055+00	2025-09-01 18:18:38.054+00
3fb0c330-45e5-4bbb-a263-a17dbb21dcda	ES	IPD	masbugs	masbugs	masbugs	15140	\N	ESP	{"latitude": 0.000001, "longitude": -0.000001}	\N	ON_STREET	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 18:23:08.767+00	t	2025-09-01 18:18:59.19+00	2025-09-01 18:23:08.767+00	2025-09-01 18:23:08.767+00
72cd96ef-dd3f-4676-ab66-1021ff46d06f	ES	IPD	ultima	ultima	ultima	15140	\N	ESP	{"latitude": 0.000001, "longitude": -0.000001}	\N	ON_STREET	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 18:27:42.748+00	t	2025-09-01 18:24:38.085+00	2025-09-01 18:27:42.749+00	2025-09-01 18:27:42.748+00
2a68c822-67d6-408b-9a86-ef782b65a3db	ES	IPD	publish	publish	publish edit	45678	\N	ESP	{"latitude": 0.000001, "longitude": -0.000001}	\N	ON_STREET	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-01 19:41:23.14+00	t	2025-09-01 18:27:59.348+00	2025-09-01 19:41:23.141+00	\N
350cb15c-b542-4191-a93b-3008054cc407	ES	IPD	examen	examen 5	examen	75757	\N	ESP	{"latitude": 0.000001, "longitude": -0.000001}	\N	PARKING_GARAGE	\N	\N	\N	\N	\N	\N	Europe/Madrid	\N	\N	\N	\N	2025-09-05 06:57:50.42+00	t	2025-09-05 06:57:50.424+00	2025-09-05 06:57:50.424+00	\N
\.


--
-- Data for Name: ocpi_tokens; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.ocpi_tokens (id, token, party_id, country_code, is_active, expires_at, created_at, last_used_at, metadata, created_at_sequelize, updated_at_sequelize) FROM stdin;
394dfd0d-ca83-44b2-9908-e10b3e556eb8	OCPI_WzvENWQIJq1SCvcjB9G4StMMhjtHKbypjqeUVgu5KurgkDUfFE3DLAoVeSG	DEMO	DE	t	\N	2025-08-26 19:31:00.879	2025-08-27 09:49:51.442	{"description":"Token generated for DEMO (DE)","generated_at":"2025-08-26T19:31:00.879Z","generated_by":"OCPI_CPO_SYSTEM","source":"credentials_exchange","requesting_roles":[{"role":"EMSP","party_id":"DEMO","country_code":"DE"}],"requesting_url":"https://another-platform.example.com/ocpi/versions/"}	\N	\N
9d22408c-a2b6-4747-b042-bd2742e1737f	OCPI_F6ca85uzAR2HvXLVXo8bF5cijizBSQohdYQkTTMYyrjD1jKrrXqk46qisKT	EXA	NL	t	\N	2025-08-26 19:27:48.777	2025-08-26 19:28:01.026	{"description":"Token generated for EXA (NL)","generated_at":"2025-08-26T19:27:48.777Z","generated_by":"OCPI_CPO_SYSTEM","source":"credentials_exchange","requesting_roles":[{"role":"EMSP","party_id":"EXA","country_code":"NL"}],"requesting_url":"https://tu-plataforma.example.com/ocpi/versions/"}	\N	\N
a126f53d-baaa-4412-853d-ce594684b1a6	OCPI_zChgOolkC4R8IuzlIYHq6EpWnDoSsAEGbRU6syQnZBG1olWizhIkqJTKR2N	TEST	ES	t	\N	2025-08-26 19:28:23.711	2025-08-26 19:30:37.725	{"description":"Token de prueba para TEST","generated_at":"2025-08-26T19:28:23.711Z","generated_by":"CLI_COMMAND","command_line":"/usr/local/bin/node /app/scripts/generate-ocpi-token.js generate --party-id TEST --country-code ES --description Token de prueba para TEST"}	\N	\N
ad4c84f4-0c3a-470f-b3c6-6bb35c9a38f4	OCPI_mEDC1y8D2zqVrmwi6w49LAjOkjs9kf472TR12iIwMzd5tvcZiVYckby1HYH	ES*EPK	ES	t	\N	2025-08-27 06:09:01.885	2025-08-27 08:20:14.109	{"description":"Token inicial para ES*EPK","generated_at":"2025-08-27T06:09:01.885Z","generated_by":"CLI_COMMAND","command_line":"/usr/local/bin/node /app/scripts/generate-ocpi-token.js generate --party-id ES*EPK --country-code ES --description Token inicial para ES*EPK"}	\N	\N
0cbcb200-6c72-4e91-a5db-226b09caa637	OCPI_DMA1DZBCnhend495FanHpensyGRE5XDR6nd9sVYt5itSJKCveCjrDl85z4d	DEMO	NL	t	\N	2025-08-27 06:24:51.836	\N	{"description":"Token generated for DEMO (NL)","generated_at":"2025-08-27T06:24:51.836Z","generated_by":"OCPI_CPO_SYSTEM","source":"credentials_exchange","requesting_roles":[{"role":"EMSP","party_id":"DEMO","country_code":"NL"}],"requesting_url":"https://tu-plataforma.example.com/ocpi/versions/"}	\N	\N
cbb59eab-78e5-4495-befb-b80978396f69	OCPI_OuQXNxTm8pFXeNOCQ6EMzrl5ixNALdIkjwhYD3sX8sQxud6KpfhZJPMeo7C	ES*EFI	ES	t	\N	2025-08-27 06:08:15.757	2025-08-28 06:57:47.135	{"description":"Token inicial para ES*EFI","generated_at":"2025-08-27T06:08:15.757Z","generated_by":"CLI_COMMAND","command_line":"/usr/local/bin/node /app/scripts/generate-ocpi-token.js generate --party-id ES*EFI --country-code ES --description Token inicial para ES*EFI"}	\N	\N
2faaec39-0686-479b-a9f6-bb2871d91f3f	OCPI_AyMtsvXtrmOaAkhgn1pmKN74yCWhu53A8uDXYHJRQwdPIJKtRnZUxg7eeYA	EPK	ES	t	\N	2025-08-27 06:14:12.01	\N	{"description":"Token inicial para EPK","generated_at":"2025-08-27T06:14:12.010Z","generated_by":"CLI_COMMAND","command_line":"/usr/local/bin/node /app/scripts/generate-ocpi-token.js generate --party-id EPK --country-code ES --description Token inicial para EPK"}	\N	\N
4f75e33f-9d99-4b00-9aa8-b03258681669	OCPI_Ah22cUqvQW18IRs7eYU3lVjEF2XUgZCpqJxU6YEANSCcRFQhTn8OHnajuli	EFI	ES	f	\N	2025-08-27 06:10:27.325	\N	{"description":"Token generated for EFI (ES)","generated_at":"2025-08-27T06:10:27.325Z","generated_by":"OCPI_CPO_SYSTEM","source":"credentials_exchange","requesting_roles":[{"role":"EMSP","party_id":"EFI","country_code":"ES"}],"requesting_url":"https://efi-platform.example.com/ocpi/versions/"}	\N	\N
default-token-id	ocpi_token_es_cpo_2024_secure_key	ES-CPO	ES	t	\N	2025-08-26 17:25:34.202171	2025-09-01 06:59:42.895	{"description": "Default token for ES-CPO", "type": "default"}	\N	\N
a98c8aa1-1200-48e1-9aa5-fe1665c41f95	OCPI_VUC2CxEAhYBuqBs8QwV1uoaLNeyZtqq0fjxzfjRlpjy7QUR2UZKVexzbeVt	EFI	ES	t	\N	2025-08-27 06:15:10.613	2025-09-05 08:42:50.303	{"description":"Token inicial para EFI","generated_at":"2025-08-27T06:15:10.613Z","generated_by":"CLI_COMMAND","command_line":"/usr/local/bin/node /app/scripts/generate-ocpi-token.js generate --party-id EFI --country-code ES --description Token inicial para EFI"}	\N	\N
532465e2-ec29-4e37-a744-1fa5fdecccd2	OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb	IPD	ES	t	\N	2025-08-28 07:34:25.529	2025-09-08 06:28:53.121	{"description":"Token generated manually for IPD","generated_at":"2025-08-28T07:34:25.529Z","generated_by":"CLI_COMMAND","command_line":"/usr/local/bin/node /app/scripts/generate-ocpi-token.js generate --party-id IPD --country-code ES"}	\N	\N
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.sessions (id, country_code, party_id, evse_uid, connector_id, id_token, start_datetime, end_datetime, total_cost, status, last_updated, created_at, updated_at, kwh) FROM stdin;
327a53ab-b681-4a74-ac88-788e198ee9c6	ES	IPD	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	ade0c39e-129f-4cc4-839d-222f38ee0151	2025-09-03 13:21:18.081+00	2025-09-03 13:45:44.445+00	\N	COMPLETED	2025-09-03 13:45:44.445+00	2025-09-03 13:21:18.082+00	2025-09-03 13:45:44.448+00	0.000
96471d96-fcc3-4272-8a43-41cd9227317f	ES	IPD	e7afc0a1-3774-42b9-be6b-1ebf773c9cb6	927214cc-f311-4d9f-985d-90a0a98b947e	ade0c39e-129f-4cc4-839d-222f38ee0151	2025-09-03 13:37:20.279+00	2025-09-03 13:55:13.708+00	\N	COMPLETED	2025-09-03 13:55:13.708+00	2025-09-03 13:37:20.279+00	2025-09-03 13:55:13.709+00	0.000
296d802d-40cc-495f-9a2e-24b5f0a8acb1	ES	IPD	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-03 13:57:52.741+00	2025-09-03 13:59:28.404+00	\N	COMPLETED	2025-09-03 13:59:28.404+00	2025-09-03 13:57:52.741+00	2025-09-03 13:59:28.405+00	0.000
e703ed53-d6c6-45a3-969f-e15e88bd5cb9	ES	IPD	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 12:30:21.613+00	2025-09-04 12:32:16.972+00	\N	COMPLETED	2025-09-04 12:32:16.972+00	2025-09-04 12:30:21.614+00	2025-09-04 12:32:16.973+00	0.676
bb9d2a41-40e3-4707-9468-580db522deb5	ES	IPD	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 06:04:03.052+00	2025-09-04 06:04:23.408+00	\N	COMPLETED	2025-09-04 06:04:23.408+00	2025-09-04 06:04:03.052+00	2025-09-04 06:04:23.409+00	0.000
9e20c3c6-c0df-4de5-a5af-77e54774a573	ES	IPD	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 06:23:53.998+00	2025-09-04 06:24:10.342+00	\N	COMPLETED	2025-09-04 06:24:10.342+00	2025-09-04 06:23:53.998+00	2025-09-04 06:24:10.343+00	0.000
a36f0dcd-dcb7-42e7-a435-1b03cfc3bc11	ES	IPD	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 14:24:42.496+00	2025-09-04 14:25:36.688+00	\N	COMPLETED	2025-09-04 14:25:36.688+00	2025-09-04 14:24:42.498+00	2025-09-04 14:25:36.688+00	0.327
57444ccd-e79a-47a5-8033-34b250525088	ES	IPD	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 14:32:56.313+00	2025-09-04 14:33:45.901+00	\N	COMPLETED	2025-09-04 14:33:45.901+00	2025-09-04 14:32:56.313+00	2025-09-04 14:33:45.901+00	0.243
0d7f93e1-c918-4f88-a289-f8df7bcef83b	ES	IPD	e7afc0a1-3774-42b9-be6b-1ebf773c9cb6	927214cc-f311-4d9f-985d-90a0a98b947e	MOCK_TEST_KEY	2025-09-04 06:38:45.289+00	2025-09-04 06:41:11.363+00	\N	COMPLETED	2025-09-04 06:41:11.363+00	2025-09-04 06:38:45.289+00	2025-09-04 06:41:11.363+00	0.000
35c3d2eb-4591-4657-814e-849f1e7f3ba4	ES	IPD	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 06:27:39.953+00	2025-09-04 06:41:13.596+00	\N	COMPLETED	2025-09-04 06:41:13.596+00	2025-09-04 06:27:39.953+00	2025-09-04 06:41:13.597+00	0.000
81c3dfd7-9e8b-4e84-80f7-3758c5612bcc	ES	IPD	e7afc0a1-3774-42b9-be6b-1ebf773c9cb6	927214cc-f311-4d9f-985d-90a0a98b947e	MOCK_TEST_KEY	2025-09-04 06:48:18.912+00	2025-09-04 06:48:42.765+00	\N	COMPLETED	2025-09-04 06:48:42.765+00	2025-09-04 06:48:18.913+00	2025-09-04 06:48:42.765+00	0.000
04133231-cef5-46ef-b8e4-e8abb42dc22b	ES	IPD	3f99cf10-4592-4d48-825d-c70d4e59e44b	b9588185-43ad-4a57-a14c-71e118c129c2	MOCK_TEST_KEY	2025-09-05 07:36:51.624+00	2025-09-05 07:41:51.596+00	\N	COMPLETED	2025-09-05 07:41:51.596+00	2025-09-05 07:36:51.625+00	2025-09-05 07:41:51.597+00	1.720
edeb6f4b-c139-417b-a9c2-12c06fa3dd65	ES	IPD	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 06:50:36.573+00	2025-09-04 06:51:35.739+00	\N	COMPLETED	2025-09-04 06:51:35.739+00	2025-09-04 06:50:36.574+00	2025-09-04 06:51:35.74+00	0.000
2503b7d7-5838-4a6f-aa67-e89af30ce2f0	ES	IPD	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 06:55:04.708+00	2025-09-04 07:16:10.797+00	\N	COMPLETED	2025-09-04 07:16:10.797+00	2025-09-04 06:55:04.708+00	2025-09-04 07:16:10.799+00	7.633
d72b95cc-8236-49b4-9c71-5a9a91b047d9	ES	IPD	e7afc0a1-3774-42b9-be6b-1ebf773c9cb6	927214cc-f311-4d9f-985d-90a0a98b947e	MOCK_TEST_KEY	2025-09-04 06:54:29.278+00	2025-09-04 07:16:12.788+00	\N	COMPLETED	2025-09-04 07:16:12.788+00	2025-09-04 06:54:29.278+00	2025-09-04 07:16:12.789+00	7.852
d9f52502-2d0d-4912-a7af-7ecb00a5d3d6	ES	IPD	5c8ed9d3-09f7-4444-8a85-595c0eabeebc	0563bdaa-50a3-446c-a885-faa980254216	MOCK_TEST_KEY	2025-09-04 08:40:45.239+00	2025-09-04 08:43:45.764+00	\N	COMPLETED	2025-09-04 08:43:45.764+00	2025-09-04 08:40:45.24+00	2025-09-04 08:43:45.764+00	1.072
\.


--
-- Data for Name: tariffs; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.tariffs (id, country_code, party_id, currency, type, elements, last_updated, created_at, updated_at, start_date_time, end_date_time, deleted_at) FROM stdin;
5684ca43-4bbc-4baa-8001-5eb387645627	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":1,"step":2}]	2025-09-02 12:24:27.299+00	2025-09-02 12:00:25.391936+00	2025-09-02 12:00:25.391936+00	2025-09-02 12:00:00+00	2025-09-04 14:00:00+00	2025-09-02 12:24:27.299
2aba0778-9e48-4ce7-b294-583a22b20900	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":1,"step":5}]	2025-09-02 12:25:04.748+00	2025-09-02 12:24:54.599057+00	2025-09-02 12:24:54.599057+00	2025-09-02 12:24:00+00	\N	2025-09-02 12:25:04.748
22b1c13d-8381-4722-8df3-fd4278c20197	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":3,"step":2}]	2025-09-02 12:27:27.493+00	2025-09-02 11:48:31.529439+00	2025-09-02 11:48:31.529439+00	2025-09-02 11:47:00+00	2025-09-04 13:48:00+00	2025-09-02 12:27:27.493
5c962802-1f96-41bb-bef0-4897cb37d250	ES	IPD	EUR	REGULAR	[{"price_components":[{"type":"ENERGY","price":0.25,"step_size":1}]}]	2025-09-02 12:29:48.114+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	\N	\N	2025-09-02 12:29:48.114
dc13581f-9779-4c29-aa0e-00c6865410f0	ES	IPD	EUR	PROFILE_FAST	[{"price_components":[{"type":"ENERGY","price":0.35,"step_size":1}]}]	2025-09-02 12:29:50.234+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	\N	\N	2025-09-02 12:29:50.234
08981df2-6def-4218-a296-b1de9a0218b3	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":1,"step":2}]	2025-09-02 12:46:49.264+00	2025-09-02 12:28:36.155149+00	2025-09-02 12:28:36.155149+00	2025-09-02 12:27:00+00	\N	2025-09-02 12:46:49.264
9cf987f5-52e3-47b3-9f5a-3ad76a19ea85	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":1,"step":7}]	2025-09-03 08:52:08.178+00	2025-09-02 12:47:14.856845+00	2025-09-02 12:47:14.856845+00	2025-09-02 12:46:00+00	\N	2025-09-03 08:52:08.178
60ed111e-685a-4546-b516-35e5332cc263	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":1,"step":1},{"component_type":"FLAT","price":2,"step":1},{"component_type":"PARKING_TIME","price":3,"step":1},{"component_type":"TIME","price":4,"step":1}]	2025-09-03 10:36:30.577+00	2025-09-03 08:53:10.909739+00	2025-09-03 08:53:10.909739+00	2025-09-03 08:52:00+00	\N	2025-09-03 10:36:30.577
578e4f8f-efb2-41cd-9056-1f6180a11b35	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":1,"step":1},{"component_type":"FLAT","price":2,"step":1},{"component_type":"PARKING_TIME","price":3,"step":1},{"component_type":"TIME","price":4,"step":1}]	2025-09-03 11:13:40.252+00	2025-09-03 10:37:13.340135+00	2025-09-03 10:37:13.340135+00	2025-09-03 10:36:00+00	\N	2025-09-03 11:13:40.252
dd904a39-2665-4b1b-9a51-580556ba1842	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":1,"step":1},{"component_type":"FLAT","price":2,"step":1},{"component_type":"PARKING_TIME","price":3,"step":1},{"component_type":"TIME","price":3.998,"step":1}]	2025-09-03 11:14:09.24+00	2025-09-03 11:14:09.24388+00	2025-09-03 11:14:09.24388+00	2025-09-03 11:13:00+00	\N	\N
1e24b9f8-40f9-4a36-a5f2-9519432c9d12	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":1,"step":1},{"component_type":"FLAT","price":2,"step":1},{"component_type":"PARKING_TIME","price":3,"step":1},{"component_type":"TIME","price":4,"step":1.2}]	2025-09-05 07:23:33.564+00	2025-09-05 07:21:26.991261+00	2025-09-05 07:21:26.991261+00	2025-09-05 07:20:00+00	\N	2025-09-05 07:23:33.564
1f8f3d4e-eac1-460e-b790-b926d983c18c	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":1,"step":1},{"component_type":"FLAT","price":2,"step":1},{"component_type":"PARKING_TIME","price":3,"step":1},{"component_type":"TIME","price":4,"step":1}]	2025-09-05 08:52:26.619+00	2025-09-05 07:24:11.626224+00	2025-09-05 07:24:11.626224+00	2025-09-05 07:23:00+00	\N	2025-09-05 08:52:26.619
8b2819ee-6f90-4c91-b8f6-ac58d4847cbe	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":2,"step":1},{"component_type":"TIME","price":3,"step":1}]	2025-09-05 09:16:20.953+00	2025-09-05 08:53:15.548948+00	2025-09-05 08:53:15.548948+00	2025-09-05 08:52:00+00	\N	2025-09-05 09:16:20.953
e8a3fb0c-5367-49a5-9eec-31070ff98765	ES	IPD	EUR	SESSIONS	[{"price_components":[{"type":"ENERGY","price":0.25,"vat":21,"step_size":1}]}]	2025-09-05 09:39:26.138+00	2025-09-05 09:19:27.033926+00	2025-09-05 09:19:27.033926+00	\N	\N	2025-09-05 09:39:26.138
724980bb-1038-405a-a641-30f35702db5d	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":1,"step":1}]	2025-09-05 09:39:28.611+00	2025-09-05 09:18:40.478389+00	2025-09-05 09:18:40.478389+00	2025-09-05 09:17:00+00	\N	2025-09-05 09:39:28.611
9f78bf06-b384-47da-b6be-749a1a46d6d1	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":1,"step":1}]	2025-09-05 10:03:30.51+00	2025-09-05 09:53:28.306476+00	2025-09-05 09:53:28.306476+00	2025-09-05 09:52:00+00	\N	2025-09-05 10:03:30.51
245eef1b-21e7-4cde-87c1-7f6bf9752422	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":1,"step":1}]	2025-09-05 10:06:34.263+00	2025-09-05 10:03:58.688916+00	2025-09-05 10:03:58.688916+00	2025-09-05 10:03:00+00	\N	2025-09-05 10:06:34.263
test-tariff-2025	ES	IPD	EUR	REGULAR	[{"price_components":[{"type":"ENERGY","price":0.25,"vat":0.21,"step_size":1}]}]	2025-09-05 10:11:05.768+00	2025-09-05 10:10:34.148922+00	2025-09-05 10:10:34.148922+00	2025-09-05 10:00:00+00	2025-12-31 23:59:59+00	2025-09-05 10:11:05.768
ebed9c3e-3c25-40fd-9c6b-7fe7c870d04b	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":1,"step":1}]	2025-09-05 10:11:07.968+00	2025-09-05 10:06:52.895068+00	2025-09-05 10:06:52.895068+00	2025-09-05 10:06:00+00	\N	2025-09-05 10:11:07.968
14d77923-ebc5-427c-b693-1fcb5e438048	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":2,"step":1}]	2025-09-05 10:13:25.694+00	2025-09-05 10:11:44.703565+00	2025-09-05 10:11:44.703565+00	2025-09-05 10:11:00+00	\N	2025-09-05 10:13:25.694
97bda0ea-d27a-49b4-a3f3-8042129ec5e0	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":1,"step":1}]	2025-09-05 10:18:13.77+00	2025-09-05 10:14:53.657095+00	2025-09-05 10:14:53.657095+00	2025-09-05 10:14:00+00	\N	2025-09-05 10:18:13.77
test-patch-fix-2025	ES	IPD	EUR	REGULAR	[{"price_components":[{"type":"ENERGY","price":0.25,"vat":0.21,"step_size":1}]}]	2025-09-05 10:20:10.502+00	2025-09-05 10:18:26.012394+00	2025-09-05 10:18:26.012394+00	2025-09-05 10:00:00+00	2025-12-31 23:59:59+00	2025-09-05 10:20:10.502
14ed4eb6-b854-4611-a1c0-8d9f8b0d81f9	ES	IPD	EUR	REGULAR	[{"component_type":"ENERGY","price":1,"step":1}]	2025-09-05 10:20:24.945+00	2025-09-05 10:20:24.949109+00	2025-09-05 10:20:24.949109+00	2025-09-05 10:20:00+00	\N	\N
test-payload-complete-2025	ES	IPD	EUR	REGULAR	[{"price_components":[{"type":"ENERGY","price":0.25,"vat":0.21,"step_size":1}]}]	2025-09-05 10:33:36.114+00	2025-09-05 10:28:51.938773+00	2025-09-05 10:28:51.938773+00	2025-09-05 10:00:00+00	2025-12-31 23:59:59+00	2025-09-05 10:33:36.114
test-exhaustive-2025	ES	IPD	EUR	REGULAR	[{"price_components":[{"type":"ENERGY","price":0.25,"vat":0.21,"step_size":1}]}]	2025-09-05 10:33:38.884+00	2025-09-05 10:27:21.501777+00	2025-09-05 10:27:21.501777+00	2025-09-05 10:00:00+00	2025-12-31 23:59:59+00	2025-09-05 10:33:38.883
\.


--
-- Data for Name: tokens; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.tokens (id, country_code, party_id, uid, type, auth_method, issuer, valid, whitelist, last_updated, created_at, updated_at, visual_number, group_id, language, default_profile_type, energy_contract, contract_id) FROM stdin;
emsp-token-001	ES	IPD	ad-hoc-user-001	AD_HOC_USER	APP_USER	EMSP_System	t	ALWAYS	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	AH001	group-001	es	REGULAR	{"provider": "EMSP_System", "type": "ad_hoc"}	contract-001
emsp-token-002	ES	IPD	ad-hoc-user-002	AD_HOC_USER	APP_USER	EMSP_System	t	ALLOWED	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	AH002	group-001	es	FAST	{"provider": "EMSP_System", "type": "ad_hoc"}	contract-002
emsp-token-003	ES	IPD	ad-hoc-user-003	AD_HOC_USER	APP_USER	EMSP_System	t	ALLOWED_OFFLINE	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	AH003	group-002	es	CHEAP	{"provider": "EMSP_System", "type": "ad_hoc"}	contract-003
emsp-token-004	ES	IPD	ad-hoc-user-004	AD_HOC_USER	APP_USER	EMSP_System	t	ALWAYS	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	AH004	group-002	es	GREEN	{"provider": "EMSP_System", "type": "ad_hoc"}	contract-004
emsp-token-005	ES	IPD	ad-hoc-user-005	AD_HOC_USER	APP_USER	EMSP_System	t	ALLOWED	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	AH005	group-003	es	REGULAR	{"provider": "EMSP_System", "type": "ad_hoc"}	contract-005
emsp-token-006	ES	IPD	app-user-001	APP_USER	APP_USER	EMSP_System	t	ALWAYS	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	AP001	group-003	es	FAST	{"provider": "EMSP_System", "type": "app_user", "app_version": "2.1.0"}	contract-006
emsp-token-007	ES	IPD	app-user-002	APP_USER	APP_USER	EMSP_System	t	ALLOWED	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	AP002	group-004	es	REGULAR	{"provider": "EMSP_System", "type": "app_user", "app_version": "2.1.0"}	contract-007
emsp-token-008	ES	IPD	app-user-003	APP_USER	APP_USER	EMSP_System	t	ALLOWED_OFFLINE	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	AP003	group-004	es	GREEN	{"provider": "EMSP_System", "type": "app_user", "app_version": "2.1.0"}	contract-008
emsp-token-009	ES	IPD	app-user-004	APP_USER	APP_USER	EMSP_System	t	ALWAYS	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	AP004	group-004	es	CHEAP	{"provider": "EMSP_System", "type": "app_user", "app_version": "2.1.0"}	contract-009
emsp-token-010	ES	IPD	app-user-005	APP_USER	APP_USER	EMSP_System	t	ALLOWED	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	AP005	group-005	es	FAST	{"provider": "EMSP_System", "type": "app_user", "app_version": "2.1.0"}	contract-010
emsp-token-011	ES	IPD	rfid-user-001	RFID	RFID	EMSP_System	t	ALWAYS	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	RF001	group-006	es	REGULAR	{"provider": "EMSP_System", "type": "rfid", "card_type": "ISO14443"}	contract-011
emsp-token-012	ES	IPD	rfid-user-002	RFID	RFID	EMSP_System	t	ALLOWED	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	RF002	group-006	es	FAST	{"provider": "EMSP_System", "type": "rfid", "card_type": "ISO14443"}	contract-012
emsp-token-013	ES	IPD	rfid-user-003	RFID	RFID	EMSP_System	t	ALLOWED_OFFLINE	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	RF003	group-007	es	GREEN	{"provider": "EMSP_System", "type": "rfid", "card_type": "ISO14443"}	contract-013
emsp-token-014	ES	IPD	rfid-user-004	RFID	RFID	EMSP_System	t	ALWAYS	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	RF004	group-007	es	CHEAP	{"provider": "EMSP_System", "type": "rfid", "card_type": "ISO14443"}	contract-014
emsp-token-015	ES	IPD	rfid-user-005	RFID	RFID	EMSP_System	t	ALLOWED	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	RF005	group-008	es	REGULAR	{"provider": "EMSP_System", "type": "rfid", "card_type": "ISO14443"}	contract-015
emsp-token-016	ES	IPD	other-user-001	OTHER	OTHER	EMSP_System	t	ALWAYS	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	OT001	group-008	es	FAST	{"provider": "EMSP_System", "type": "other", "description": "Token especial para vehículos comerciales"}	contract-016
emsp-token-017	ES	IPD	other-user-002	OTHER	OTHER	EMSP_System	t	ALLOWED	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	OT002	group-009	es	REGULAR	{"provider": "EMSP_System", "type": "other", "description": "Token para flotas corporativas"}	contract-017
emsp-token-018	ES	IPD	other-user-003	OTHER	OTHER	EMSP_System	t	ALLOWED_OFFLINE	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	OT003	group-009	es	GREEN	{"provider": "EMSP_System", "type": "other", "description": "Token para vehículos de emergencia"}	contract-018
emsp-token-019	ES	IPD	other-user-004	OTHER	OTHER	EMSP_System	t	ALWAYS	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	OT004	group-010	es	CHEAP	{"provider": "EMSP_System", "type": "other", "description": "Token para vehículos de prueba"}	contract-019
emsp-token-020	ES	IPD	other-user-005	OTHER	OTHER	EMSP_System	t	ALLOWED	2025-08-31 14:39:40.205479+00	2025-08-31 14:39:40.205479+00	2025-08-31 14:58:02.747049+00	OT005	group-010	es	FAST	{"provider": "EMSP_System", "type": "other", "description": "Token para vehículos de demostración"}	contract-020
f85581ed-a048-4e48-af53-65f88b29f7eb	ES	EFI	MOCK_TEST_KEY	OTHER	AUTH_REQUEST	empark	t	NEVER	2025-09-01 09:04:55.254+00	2025-09-03 11:31:09.532343+00	2025-09-03 11:31:09.532343+00	\N	\N	\N	\N	\N	ES-EFI-CE2A21CBB-4
8d311dee-7a13-42f6-b8bc-9e905218d26a	ES	EFI	ade0c39e-129f-4cc4-839d-222f38ee0151	OTHER	AUTH_REQUEST	empark	t	NEVER	2025-09-01 09:04:55.254+00	2025-09-03 12:42:20.09642+00	2025-09-03 12:42:20.09642+00	\N	\N	\N	\N	\N	ES-EFI-CE2A21CBB-4
\.


--
-- Name: cdrs cdrs_pkey; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.cdrs
    ADD CONSTRAINT cdrs_pkey PRIMARY KEY (id);


--
-- Name: credentials credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.credentials
    ADD CONSTRAINT credentials_pkey PRIMARY KEY (id);


--
-- Name: emsp_cdrs emsp_cdrs_pkey; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.emsp_cdrs
    ADD CONSTRAINT emsp_cdrs_pkey PRIMARY KEY (id);


--
-- Name: emsp_contracts emsp_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.emsp_contracts
    ADD CONSTRAINT emsp_contracts_pkey PRIMARY KEY (id);


--
-- Name: emsp_evses emsp_evses_pkey; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.emsp_evses
    ADD CONSTRAINT emsp_evses_pkey PRIMARY KEY (id);


--
-- Name: emsp_locations emsp_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.emsp_locations
    ADD CONSTRAINT emsp_locations_pkey PRIMARY KEY (id);


--
-- Name: emsp_sessions emsp_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.emsp_sessions
    ADD CONSTRAINT emsp_sessions_pkey PRIMARY KEY (id);


--
-- Name: emsp_sessions emsp_sessions_unique; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.emsp_sessions
    ADD CONSTRAINT emsp_sessions_unique UNIQUE (country_code, party_id, session_id);


--
-- Name: emsp_tariffs emsp_tariffs_pkey; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.emsp_tariffs
    ADD CONSTRAINT emsp_tariffs_pkey PRIMARY KEY (id);


--
-- Name: emsp_tokens emsp_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.emsp_tokens
    ADD CONSTRAINT emsp_tokens_pkey PRIMARY KEY (id);


--
-- Name: evses evses_pkey; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.evses
    ADD CONSTRAINT evses_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: ocpi_tokens ocpi_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.ocpi_tokens
    ADD CONSTRAINT ocpi_tokens_pkey PRIMARY KEY (id);


--
-- Name: ocpi_tokens ocpi_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.ocpi_tokens
    ADD CONSTRAINT ocpi_tokens_token_key UNIQUE (token);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: tariffs tariffs_pkey; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.tariffs
    ADD CONSTRAINT tariffs_pkey PRIMARY KEY (id);


--
-- Name: tokens tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (id);


--
-- Name: cdrs_country_code_party_id; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX cdrs_country_code_party_id ON public.cdrs USING btree (country_code, party_id);


--
-- Name: cdrs_end_datetime; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX cdrs_end_datetime ON public.cdrs USING btree (end_datetime);


--
-- Name: cdrs_evse_uid; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX cdrs_evse_uid ON public.cdrs USING btree (evse_uid);


--
-- Name: cdrs_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX cdrs_last_updated ON public.cdrs USING btree (last_updated);


--
-- Name: cdrs_session_id; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX cdrs_session_id ON public.cdrs USING btree (session_id);


--
-- Name: cdrs_start_datetime; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX cdrs_start_datetime ON public.cdrs USING btree (start_datetime);


--
-- Name: emsp_tokens_emsp_party_id_emsp_country_code; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX emsp_tokens_emsp_party_id_emsp_country_code ON public.emsp_tokens USING btree (emsp_party_id, emsp_country_code);


--
-- Name: emsp_tokens_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX emsp_tokens_last_updated ON public.emsp_tokens USING btree (last_updated);


--
-- Name: evses_country_code_party_id; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX evses_country_code_party_id ON public.evses USING btree (country_code, party_id);


--
-- Name: evses_deleted_at; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX evses_deleted_at ON public.evses USING btree (deleted_at);


--
-- Name: evses_evse_id; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX evses_evse_id ON public.evses USING btree (evse_id);


--
-- Name: evses_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX evses_last_updated ON public.evses USING btree (last_updated);


--
-- Name: evses_location_id; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX evses_location_id ON public.evses USING btree (location_id);


--
-- Name: evses_status; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX evses_status ON public.evses USING btree (status);


--
-- Name: idx_cdrs_country_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_cdrs_country_party ON public.cdrs USING btree (country_code, party_id);


--
-- Name: idx_cdrs_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_cdrs_last_updated ON public.cdrs USING btree (last_updated);


--
-- Name: idx_credentials_country_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_credentials_country_party ON public.credentials USING btree (country_code, party_id);


--
-- Name: idx_credentials_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_credentials_last_updated ON public.credentials USING btree (last_updated);


--
-- Name: idx_emsp_cdrs_emsp_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_cdrs_emsp_party ON public.emsp_cdrs USING btree (emsp_party_id, emsp_country_code);


--
-- Name: idx_emsp_cdrs_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_cdrs_last_updated ON public.emsp_cdrs USING btree (last_updated);


--
-- Name: idx_emsp_contracts_emsp_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_contracts_emsp_party ON public.emsp_contracts USING btree (emsp_party_id, emsp_country_code);


--
-- Name: idx_emsp_contracts_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_contracts_last_updated ON public.emsp_contracts USING btree (last_updated);


--
-- Name: idx_emsp_evses_emsp_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_evses_emsp_party ON public.emsp_evses USING btree (emsp_party_id, emsp_country_code);


--
-- Name: idx_emsp_evses_evse_id; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_evses_evse_id ON public.emsp_evses USING btree (evse_id);


--
-- Name: idx_emsp_evses_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_evses_last_updated ON public.emsp_evses USING btree (last_updated);


--
-- Name: idx_emsp_evses_location_id; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_evses_location_id ON public.emsp_evses USING btree (location_id);


--
-- Name: idx_emsp_evses_status; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_evses_status ON public.emsp_evses USING btree (status);


--
-- Name: idx_emsp_locations_emsp_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_locations_emsp_party ON public.emsp_locations USING btree (emsp_party_id, emsp_country_code);


--
-- Name: idx_emsp_locations_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_locations_last_updated ON public.emsp_locations USING btree (last_updated);


--
-- Name: idx_emsp_sessions_country_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_sessions_country_party ON public.emsp_sessions USING btree (country_code, party_id);


--
-- Name: idx_emsp_sessions_created_at; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_sessions_created_at ON public.emsp_sessions USING btree (created_at);


--
-- Name: idx_emsp_sessions_emsp_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_sessions_emsp_party ON public.emsp_sessions USING btree (emsp_party_id, emsp_country_code);


--
-- Name: idx_emsp_sessions_evse_uid; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_sessions_evse_uid ON public.emsp_sessions USING btree (evse_uid);


--
-- Name: idx_emsp_sessions_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_sessions_last_updated ON public.emsp_sessions USING btree (last_updated);


--
-- Name: idx_emsp_sessions_location_id; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_sessions_location_id ON public.emsp_sessions USING btree (location_id);


--
-- Name: idx_emsp_sessions_session_id; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_sessions_session_id ON public.emsp_sessions USING btree (session_id);


--
-- Name: idx_emsp_sessions_status; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_sessions_status ON public.emsp_sessions USING btree (status);


--
-- Name: idx_emsp_tariffs_emsp_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_tariffs_emsp_party ON public.emsp_tariffs USING btree (emsp_party_id, emsp_country_code);


--
-- Name: idx_emsp_tariffs_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_tariffs_last_updated ON public.emsp_tariffs USING btree (last_updated);


--
-- Name: idx_emsp_tokens_emsp_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_tokens_emsp_party ON public.emsp_tokens USING btree (emsp_party_id, emsp_country_code);


--
-- Name: idx_emsp_tokens_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_tokens_last_updated ON public.emsp_tokens USING btree (last_updated);


--
-- Name: idx_emsp_tokens_party_id; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_tokens_party_id ON public.tokens USING btree (party_id) WHERE ((party_id)::text ~~ 'EMSP%'::text);


--
-- Name: idx_emsp_tokens_type; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_tokens_type ON public.tokens USING btree (type) WHERE ((party_id)::text ~~ 'EMSP%'::text);


--
-- Name: idx_emsp_tokens_valid; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_tokens_valid ON public.tokens USING btree (valid) WHERE ((party_id)::text ~~ 'EMSP%'::text);


--
-- Name: idx_evses_country_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_evses_country_party ON public.evses USING btree (country_code, party_id);


--
-- Name: idx_evses_deleted_at; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_evses_deleted_at ON public.evses USING btree (deleted_at);


--
-- Name: idx_evses_evse_id; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_evses_evse_id ON public.evses USING btree (evse_id);


--
-- Name: idx_evses_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_evses_last_updated ON public.evses USING btree (last_updated);


--
-- Name: idx_evses_location_id; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_evses_location_id ON public.evses USING btree (location_id);


--
-- Name: idx_evses_status; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_evses_status ON public.evses USING btree (status);


--
-- Name: idx_locations_country_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_locations_country_party ON public.locations USING btree (country_code, party_id);


--
-- Name: idx_locations_deleted_at; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_locations_deleted_at ON public.locations USING btree (deleted_at);


--
-- Name: idx_locations_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_locations_last_updated ON public.locations USING btree (last_updated);


--
-- Name: idx_ocpi_tokens_active; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_ocpi_tokens_active ON public.ocpi_tokens USING btree (is_active);


--
-- Name: idx_ocpi_tokens_expires; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_ocpi_tokens_expires ON public.ocpi_tokens USING btree (expires_at);


--
-- Name: idx_ocpi_tokens_party_country; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_ocpi_tokens_party_country ON public.ocpi_tokens USING btree (party_id, country_code);


--
-- Name: idx_ocpi_tokens_token; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_ocpi_tokens_token ON public.ocpi_tokens USING btree (token);


--
-- Name: idx_sessions_active; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_sessions_active ON public.sessions USING btree (evse_uid, status) WHERE (status = 'ACTIVE'::public.session_status_enum);


--
-- Name: idx_sessions_country_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_sessions_country_party ON public.sessions USING btree (country_code, party_id);


--
-- Name: idx_sessions_evse_uid; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_sessions_evse_uid ON public.sessions USING btree (evse_uid);


--
-- Name: idx_sessions_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_sessions_last_updated ON public.sessions USING btree (last_updated);


--
-- Name: idx_sessions_status; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_sessions_status ON public.sessions USING btree (status);


--
-- Name: idx_tariffs_country_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_tariffs_country_party ON public.tariffs USING btree (country_code, party_id);


--
-- Name: idx_tariffs_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_tariffs_last_updated ON public.tariffs USING btree (last_updated);


--
-- Name: idx_tokens_country_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_tokens_country_party ON public.tokens USING btree (country_code, party_id);


--
-- Name: idx_tokens_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_tokens_last_updated ON public.tokens USING btree (last_updated);


--
-- Name: locations_country_code_party_id; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX locations_country_code_party_id ON public.locations USING btree (country_code, party_id);


--
-- Name: locations_deleted_at; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX locations_deleted_at ON public.locations USING btree (deleted_at);


--
-- Name: locations_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX locations_last_updated ON public.locations USING btree (last_updated);


--
-- Name: ocpi_tokens_expires_at; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX ocpi_tokens_expires_at ON public.ocpi_tokens USING btree (expires_at);


--
-- Name: ocpi_tokens_is_active; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX ocpi_tokens_is_active ON public.ocpi_tokens USING btree (is_active);


--
-- Name: ocpi_tokens_party_id_country_code; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX ocpi_tokens_party_id_country_code ON public.ocpi_tokens USING btree (party_id, country_code);


--
-- Name: ocpi_tokens_token; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX ocpi_tokens_token ON public.ocpi_tokens USING btree (token);


--
-- Name: tariffs_country_code_party_id; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX tariffs_country_code_party_id ON public.tariffs USING btree (country_code, party_id);


--
-- Name: tariffs_currency; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX tariffs_currency ON public.tariffs USING btree (currency);


--
-- Name: tariffs_deleted_at; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX tariffs_deleted_at ON public.tariffs USING btree (deleted_at);


--
-- Name: tariffs_end_date_time; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX tariffs_end_date_time ON public.tariffs USING btree (end_date_time);


--
-- Name: tariffs_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX tariffs_last_updated ON public.tariffs USING btree (last_updated);


--
-- Name: tariffs_start_date_time; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX tariffs_start_date_time ON public.tariffs USING btree (start_date_time);


--
-- Name: tariffs_type; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX tariffs_type ON public.tariffs USING btree (type);


--
-- Name: tokens_contract_id; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX tokens_contract_id ON public.tokens USING btree (contract_id);


--
-- Name: tokens_country_code_party_id; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX tokens_country_code_party_id ON public.tokens USING btree (country_code, party_id);


--
-- Name: tokens_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX tokens_last_updated ON public.tokens USING btree (last_updated);


--
-- Name: tokens_type; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX tokens_type ON public.tokens USING btree (type);


--
-- Name: tokens_uid; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX tokens_uid ON public.tokens USING btree (uid);


--
-- Name: tokens_valid; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX tokens_valid ON public.tokens USING btree (valid);


--
-- Name: evses evses_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.evses
    ADD CONSTRAINT evses_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cdrs fk_cdrs_session_id; Type: FK CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.cdrs
    ADD CONSTRAINT fk_cdrs_session_id FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: evses fk_evses_location_id; Type: FK CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.evses
    ADD CONSTRAINT fk_evses_location_id FOREIGN KEY (location_id) REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions fk_sessions_evse; Type: FK CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT fk_sessions_evse FOREIGN KEY (evse_uid) REFERENCES public.evses(id) ON DELETE CASCADE;


--
-- Name: sessions fk_sessions_evse_uid; Type: FK CONSTRAINT; Schema: public; Owner: cpo_user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT fk_sessions_evse_uid FOREIGN KEY (evse_uid) REFERENCES public.evses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO cpo_user;


--
-- PostgreSQL database dump complete
--

\unrestrict 7Afld510AJrDQrJeTcGNGNr7IiOaYj99WJgk6obvZHCKPeA182MGAjHp7nkvTu5

