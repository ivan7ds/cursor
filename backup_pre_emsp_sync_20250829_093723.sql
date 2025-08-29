--
-- PostgreSQL database dump
--

\restrict sb7ug4whW3wUMVPqbpeBsj9oMlcULVXdNfF9wvT1x7I56mpJFfa9szjPUIEH8iI

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
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.emsp_sessions OWNER TO cpo_user;

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
    updated_at timestamp with time zone DEFAULT now() NOT NULL
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
    updated_at timestamp with time zone DEFAULT now() NOT NULL
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
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sessions OWNER TO cpo_user;

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
    end_date_time timestamp with time zone
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
-- Data for Name: cdrs; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.cdrs (id, country_code, party_id, session_id, evse_uid, connector_id, id_token, start_datetime, end_datetime, total_energy, total_cost, currency, total_parking_time, total_time, last_updated, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: credentials; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.credentials (id, token, url, business_details, party_id, country_code, last_updated, created_at, updated_at) FROM stdin;
dd9d555e-2bd5-40b4-b09a-3145d3050feb	YzY1ZWMxNTZmZjJmY2NiMDMxYWQxZDY1YjFlN2VkMWM1YzVkNzVmZmQ5OGZiZGIw	https://ocpi-api.pre.efimob.net/ocpi/versions	{"logo":{"url":"https://static.evolve.telpark.com/images/iop/telpark_logo.png","type":"png","category":"OPERATOR","thumbnail":"https://static.evolve.telpark.com/images/iop/telpark_logo.png"},"name":"TELPARK","website":"https://www.telpark.com/es/"}	IPD	ES	2025-08-28 07:17:50.704+00	2025-08-27 09:03:01.55+00	2025-08-28 07:17:50.706+00
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
\.


--
-- Data for Name: emsp_locations; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.emsp_locations (id, emsp_party_id, emsp_country_code, location_id, name, address, city, postal_code, state, country, coordinates, related_locations, parking_type, evse_list, directions, operator, suboperator, owner, facilities, time_zone, opening_times, charging_when_closed, images, energy_mix, last_updated, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: emsp_sessions; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.emsp_sessions (id, emsp_party_id, emsp_country_code, session_id, evse_uid, connector_id, id_token, start_datetime, end_datetime, total_cost, status, last_updated, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: emsp_tariffs; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.emsp_tariffs (id, emsp_party_id, emsp_country_code, tariff_id, currency, type, elements, start_date_time, end_date_time, last_updated, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: emsp_tokens; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.emsp_tokens (id, emsp_party_id, emsp_country_code, token_uid, type, contract_id, visual_number, issuer, group_id, valid, whitelist, language, default_profile_type, energy_contract, last_updated, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: evses; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.evses (id, location_id, country_code, party_id, evse_id, status, capabilities, connectors, floor_level, coordinates, physical_reference, directions, parking_restrictions, group_id, last_updated, created_at, updated_at) FROM stdin;
a6dcd3ff-5e85-4f0f-a419-82ef71c777de	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00003	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"76255295-d293-45e8-ad3f-0a7fff1bc85e","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC3	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
726b1c68-c2db-4c6a-8772-bb432697742c	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00004	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"2da00c22-360b-455a-80fb-5de7005c2d0a","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC4	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
b730cfa9-6605-4ea2-8929-c1769da6c5c1	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00006	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"a2d7ec16-c0ea-41e4-99fe-b79e50bd3186","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC6	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
079a9a96-facc-4308-985f-737ad92e1b57	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00007	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"33746b30-1f15-47bc-a262-af4b06dc3725","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC7	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
237fd773-6b82-426d-9ba4-8a0ad1b6e3d7	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00008	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"73727011-ad47-49af-8e4a-d9343a8eba7c","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC8	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
75e0cc31-e209-486e-91a3-00911703cfd1	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00009	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"27590684-30b8-4239-922f-bd7ce5a7d1eb","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC9	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
f0ad61ab-be3c-4c81-b2d1-deeaaa2f5294	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00010	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"49d52dbd-30e6-4c7f-8c8c-5e42173f36a8","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC10	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
e9142290-c35c-4ed0-8423-766d42b38d7a	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00011	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"75d70329-46dd-4306-afe6-b364406450bd","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC11	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
d1e3472c-358f-4576-9a31-d74eb3b265ab	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00012	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"3418d7db-e27e-4aab-91c8-524f0d7f810b","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC12	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
f309e72f-f634-4f95-bb39-0acd04d05d56	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00013	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"b7e72e09-3c5b-4630-a50a-6f27bcc1ca3d","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC13	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
788fecce-88e2-4acf-9ea1-d5099955841e	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00014	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"d769b29e-4a85-4286-a60c-1a912147a855","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC14	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
f81927a4-48fe-45db-911b-564a50e3bcc4	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00015	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"54a2e972-d682-4607-b090-b1b6e36c3546","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC15	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
36418309-e2e1-4682-b64b-067adaa23e5d	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00016	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"e036db85-47d7-400b-9c55-8f63c7cfbb06","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC16	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
5604996e-7596-4dcd-84eb-89295c9de408	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00017	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"9e216d0e-9c34-45b1-9e4a-dd29cdafce06","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC17	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
6bab1905-8c2f-47be-bcd4-c67f314575c5	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00018	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"fa04ffec-082d-42c3-bfef-4d58c6ba81a5","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC18	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
3eb58541-066a-40a6-aed4-05f54c4303d0	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00019	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"2d94d144-c79d-4cfd-88fe-ef7ecb951fc2","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC19	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
92215adb-2200-4060-9c20-4743d7dfd409	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00020	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"51bd33d2-1316-4950-a51e-e3c346205b2d","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC20	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
45676629-a54f-40d0-a264-9428f0f0edc3	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00002	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"a0113fc4-dd06-4ea2-a130-d4bb410d70e9","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC2	\N	\N	\N	2025-08-29 07:37:14.582+00	2025-08-26 12:47:51.876+00	2025-08-29 07:37:14.583+00
7fdb79eb-c750-4c6c-a270-956114976010	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00005	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"012ea589-b647-4a6f-8382-69889cfb853e","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC5	\N	\N	\N	2025-08-29 07:37:14.773+00	2025-08-26 12:47:51.876+00	2025-08-29 07:37:14.774+00
a1844a26-2e80-42ba-aa35-5607c567e780	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00021	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"75a8954b-0e08-4804-b599-815bd298ea4c","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC21	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
b4c387a9-50b2-4856-9ade-fff65461867c	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00022	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"044ee601-27f4-402d-9d81-83ed491d46f4","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC22	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
127c3b85-da24-462c-8f22-afd79b7df704	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00023	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"1cb6b2fd-a2d0-48fc-b324-57bd876cbbe6","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC23	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
606ae632-ab71-42d3-9a9f-ae7a8a8ee859	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00024	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"4bfdcdac-3322-43ae-8c3a-a929878f5908","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC24	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
c19f5395-23c8-4ef9-a42a-43c9aa00aa3a	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00025	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"af65d668-8d29-4de1-a388-ae53dcceed23","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC25	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
a74077cc-161a-43a0-977d-5ef6a642d248	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00026	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"40848fe8-c673-4a78-8f9a-bd6fbec0bca1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC26	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
353c1dbd-48ac-4939-96f6-9623b5fe72b7	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00027	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"06a5b50e-c37a-4de8-837c-50bb7e01b98b","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC27	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
543606af-96bd-4f3a-ad1a-55191e522e8c	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00028	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"09a8d92b-eae8-44bc-998b-f54a71e2897a","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC28	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
4034f915-7782-4339-a533-f0d63b90d46f	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00029	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"072d78ae-9ec4-4409-bb03-7aa404559533","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC29	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
31030438-bb2a-49c5-a2a7-6322383f6c47	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00030	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"6c9198d0-3b6f-440a-8a5b-b86d6a253679","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC30	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
c46ffd32-4f15-4acc-983d-b68a1933a6b9	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00031	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"ffbd81fe-c47f-4b0b-ade4-9e485595f03d","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC31	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
1f3df7ff-b039-43c3-8f13-6e726e88eda0	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00032	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"5ba81732-f33a-4228-957a-ee9151a476b9","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC32	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
22811b88-9b8f-4070-ae82-06134195659d	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00033	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"d9762115-93a7-4480-b97d-c94d8fb795e7","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC33	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
f5323c1b-c681-4223-9447-ce17561d6819	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00034	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"60a2fb67-478a-4fd7-9016-bc4c004fe736","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC34	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
62bb68cd-89ab-4a51-8df9-9258700e7d80	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00035	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"3fa54175-c895-411f-94fc-afa108974306","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC35	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
9cb18805-f448-48df-baa4-5bbf02d021d6	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00036	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"03d21b10-fa66-4973-a116-559ed9688219","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC36	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
78c516d7-911e-4982-8034-6ca802be34ca	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00037	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"dedb0689-63a1-4aac-a974-1220366d39b4","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC37	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
0553e7a2-74aa-4bf1-a699-0a7140898265	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00038	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"0fd4c936-bfcf-4c55-99f8-f753bd5d880f","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC38	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
eef6d362-ae53-47fa-967c-aaaf1250c62c	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00039	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"781c9e0c-d5f1-45c5-8d10-e5d5cd4157ec","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC39	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
77ddd03d-862a-4fc6-a48b-b944d98b701f	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00040	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"c9936aef-d9dd-497f-8a68-163727996833","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC40	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
01fec2a1-d4bd-459a-95f6-9181c93280c5	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00041	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"a71b5eea-0e50-4f86-8d69-e71d3ec96d58","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC41	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
b4134a90-0195-412f-9de0-27473b23f68b	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00042	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"e4836f32-7388-4b29-b632-89523d0a2f26","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC42	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
f6c0f6b6-c1b9-4820-a1be-344d10f1c4d2	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00043	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"23d03c40-e44f-42a1-be57-528f0c56bd42","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC43	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
a30c7ca3-6a4b-4051-9ae7-7739b63846ee	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00044	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"78656a56-6eef-4142-93fc-14588e1078b4","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC44	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
372b4815-6474-4845-9e49-e546ffb2b33d	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00045	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"05fb3a0f-f88f-49d1-a6c5-fdae0a51c480","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC45	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
797abeb9-f527-42e5-87cd-43299a7f1f1c	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00046	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"e7651864-7c00-464c-a05d-82080e664007","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC46	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
6c976bd9-65f4-4156-b6a5-275e9e0e9cf5	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00047	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"c504f32f-dd40-44ad-9b48-fc57839713e5","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC47	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
d481d280-2a3f-45b8-830e-30b33a8c3210	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00048	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"dd844295-14b7-4a3b-a1ba-6a7941cfb68e","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC48	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
26650b7a-815a-43ff-87a2-01d68a598e90	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00049	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"61b1661f-7ef1-406d-a51d-581318995ae9","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC49	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
8530acbd-795b-4b66-a667-5be86166848d	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00050	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"8f3d47e3-8a67-479d-ac93-b72ed7c5ebad","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC50	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
d5a5b2b6-6606-4d1b-b482-10b75bd7638d	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00051	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"bff8923c-f470-4f53-903b-2efcbc98491e","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC51	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
981b9d9f-11a2-464f-a41a-1cbcfeb975af	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00052	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"438198af-1aae-4fc9-aa36-b264d9944019","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC52	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
98c4f8f8-6524-4257-b7fe-553bce42c2b7	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00053	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"1040b9c0-18a1-4e60-96e2-3d3e2d4f1f3e","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC53	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
5b91513b-4e92-4390-b3da-029f03d7bfbb	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00054	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"568ea7cf-1f43-4f5f-9f83-0ba11a3cce8e","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC54	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
156597c1-c3d1-4748-a3fd-edeb982b9635	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00055	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"5f0b544c-7a87-4ab1-bfd9-1909d1c32cf6","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC55	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
6d26b572-a9d8-4654-89d6-b188d5e0f7a7	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00056	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"90f7e670-b92e-40c9-b789-9fa00a535d1f","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC56	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
12dc7b0a-df71-429a-ba06-13ed40d1c0f8	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00057	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"c0682bcf-efe9-460c-a217-2d4786175e47","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC57	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
cdc2cac4-6d8d-457a-884f-b716abb3862f	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00058	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"14ec035e-0057-4b21-90b8-9cde082f7114","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC58	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
08ce3dac-4ae1-4fd9-af32-bc08cb096e50	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00059	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"ab8bc2c0-b051-48cb-8f00-d4597c8670d7","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC59	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
710aa01b-e357-43fa-b619-193914c0c572	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00060	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"680b1bb3-3ef6-4566-9b39-3754afeddd4d","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC60	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
22b33bdb-cb5b-4df2-9365-51da11d06049	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00061	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"64e734f2-2cf6-49f9-9565-deebbc2176df","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC61	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
152b9e03-7b2a-413a-a873-94cbf4b37c4b	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00062	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"21cdb727-3d9c-497f-94f9-06df40ee1e26","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC62	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
04deebbb-499b-43e8-bbe9-b77381fd67c2	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00063	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"30b193d4-09ef-40e4-971a-aa56a9d70548","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC63	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
33029de5-b834-4c24-8eb6-73d0e3e494de	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00064	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"fbf30b53-e7fe-456e-b0c8-1e4a6f22aefe","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC64	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
e264f530-6275-4eb6-9083-55fd7311a6a8	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00065	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"3677fc2e-5182-4a47-a7b8-1c38cdeaf950","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC65	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
426b55ff-743a-4537-a97d-3d41e58f4d7e	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00066	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"1e44dd25-84c2-4caf-b67e-d9ae8aba6297","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC66	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
f6772581-8f9d-473e-8b91-a7e2caa275d8	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00067	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"fb1cf5c6-ebff-4c38-a9b8-1f8a4bd7d952","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC67	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
50e03a2b-f5f4-42d5-ae16-1b7dcbca92ec	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00068	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"546c004f-672e-4f3c-a176-d7f08dacabf9","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC68	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
7210651a-6226-4e22-8d1f-022014cbd19c	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00069	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"46a9c399-af91-4907-80f4-e41ebc7d1535","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC69	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
84ae75a6-7bf4-4b2d-9eda-fa33a19b5fc4	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00070	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"6bb9d4dd-8c65-4767-b460-ec203a071029","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC70	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
da4939b9-8eca-47ab-bf85-9278922709cc	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00071	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"a078f690-f78a-4777-ae9c-1a6a8fb2d914","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC71	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
8c079a5c-a35f-45aa-a837-933c5277c42f	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00072	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"1baf739b-c294-40c0-baf9-03fe4199bee1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC72	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
a76ff002-43a9-4638-9663-01ade8473474	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00073	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"9ebd8884-0be9-4cfe-8deb-2e71f58b2430","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC73	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
8baa2e98-53a0-49c6-b843-6921ff0aeeb3	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00074	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"6099f938-2213-4ef6-9be2-97383a8d982f","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC74	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
e67d7020-29c7-44e4-970f-26ef5808861b	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00075	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"c9d1e492-2e38-4691-b881-e15c3892f3fb","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC75	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
01452be4-e825-4b44-bc12-8cbbe1c0c481	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00076	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"ee60a517-5757-4944-8548-f29c906ab54a","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC76	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
9eebff93-0b00-4f8a-9443-0a6cddbae22e	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00077	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"80efa496-7214-4d19-91af-f6f42fd51d41","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC77	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
aa56db6d-a79e-46cf-adb1-545c587643af	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00078	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"74d8fa48-e739-44d6-b5a9-cc46381863c8","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC78	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
b846d51a-af56-446b-8a79-b9e0516d26f1	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00079	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"d863e2c3-ce28-478d-b75b-42220e033ad1","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC79	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
b33f1b4e-fbbb-4a30-b886-fbe9161aacd2	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00080	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"ccfd7c2b-bb20-40c4-b3a7-498ff9aff9bc","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC80	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
edf15994-f62e-4681-8ead-15cae327651a	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00081	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"0c7c9800-5b92-4e0c-ab97-3d754cd5fd70","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC81	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
b09b499a-fed8-4262-aa88-e2c00c5ba36e	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00082	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"95a3cf79-ad8e-4a03-b612-59d05b584ad6","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC82	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
bef91273-3398-44df-9134-d02f88381788	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00083	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"bf539c25-c771-4d8d-8780-fb2bd02f6f0a","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC83	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
fe48c33a-bbb4-4e28-a97d-8006fd24d9cb	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00084	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"39dc053b-00c7-4cda-beef-cdcd10c9f087","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC84	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
a1c9ac7f-243b-40aa-90dd-6bdb90d50d59	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00085	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"293a858a-33d5-4c95-b162-5c433a978830","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC85	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
09112a07-294b-4433-9a37-1d6b4d12eacf	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00086	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"5bb0ab2f-4cd4-4500-98f1-7ddfcd2d5d12","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC86	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
d0900a72-97fd-4570-befc-758f83b22236	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00087	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"cf3e10c0-986e-41ed-b2a7-4cbc8854eee4","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC87	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
40bc1520-92f6-424c-9035-8769dd3f8a25	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00088	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"4e1ccf03-da22-443f-ad07-ca34d64cedb5","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC88	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
cba7221f-ebde-418d-b368-d4e243b3434f	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00089	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"8de69209-e471-4e4b-bdc5-6c8eba95dc9b","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC89	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
42d63571-be13-4a90-887e-7abf24179e36	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00090	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"fe11d343-9a04-4a48-9180-2f9993b2f7e4","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC90	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
589075f9-528c-4be8-be2c-1f62fe402ab9	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00091	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"c5204640-4eb9-47d0-9585-5ac74e6823f5","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC91	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
66392e41-2b1f-4934-8873-fcbbd5675a7d	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00092	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"f4022dca-effe-4041-a46c-7164560fed2c","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC92	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
fd2e1cdf-a02e-4786-97d1-fe912fcd0b27	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00093	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"fd1e4c07-35bb-400c-869c-e746b7e9fc2d","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC93	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
5af4cadb-5c98-4a97-b21c-fe3d651584e2	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00094	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"c6e7f241-a811-4c56-a11d-a9d1967736d7","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC94	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
645a5576-94c5-4813-8b5d-90e7e0107d72	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00095	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"efc1b673-d43e-4f9e-bf98-2bc38f3c2ab0","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC95	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
8745ff3a-4252-4981-9955-cda3ae6cf078	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00096	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"2f6d40b9-2527-4dd2-a5c3-414cfad22a62","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC96	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
e4c4a689-4b87-4845-9551-94a8226065aa	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00097	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"341fb0fd-e6bb-4eaa-8a56-0b1a9c957275","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC97	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
1ca4acdc-08f5-4752-b1d7-14dafc26c91d	64d71462-3097-4abf-a718-140d9205257c	ES	IPD	EVSE-00098	OUTOFORDER	["REMOTE_START_STOP_CAPABLE"]	[{"id":"6f73a247-e1d6-4c58-a373-a38742d11ef8","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.3851,"longitude":2.1734}	LOC98	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
28cece0a-6649-438f-8ffe-07810b072699	8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	EVSE-00099	CHARGING	["REMOTE_START_STOP_CAPABLE"]	[{"id":"9831cba6-006b-4401-b3d2-114913ef6483","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":41.1579,"longitude":-8.6291}	LOC99	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
39b37204-abf9-4aad-a49c-8486e335260f	c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	EVSE-00100	AVAILABLE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"5dec8de6-d299-471c-99ba-5730ed6a8643","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":38.7223,"longitude":-9.1393}	LOC100	\N	\N	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
f68cccdb-17bf-41a3-9408-d264b5a8cc4c	f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	EVSE-00001	INOPERATIVE	["REMOTE_START_STOP_CAPABLE"]	[{"id":"1833274c-8e3c-4a96-9ca5-63d910cd14d3","standard":"IEC_62196_T2","format":"SOCKET","power_type":"AC_3_PHASE","voltage":230,"amperage":32}]	\N	{"latitude":40.4168,"longitude":-3.7038}	LOC1	\N	\N	\N	2025-08-29 07:37:14.373+00	2025-08-26 12:47:51.876+00	2025-08-29 07:37:14.374+00
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.locations (id, country_code, party_id, name, address, city, postal_code, state, country, coordinates, related_locations, parking_type, evses, directions, operator, suboperator, owner, facilities, time_zone, opening_times, charging_when_closed, images, energy_mix, last_updated, publish, created_at, updated_at) FROM stdin;
f94e5616-b8f9-4092-b9b5-d85d57316963	ES	IPD	Centro Comercial Madrid	Calle Gran Vía 28	Madrid	28013	Madrid	ESP	{"latitude": 40.4168, "longitude": -3.7038}	[]	PARKING_GARAGE	[]	{}	{}	\N	{}	["RESTAURANT","SHOPPING","PARKING"]	Europe/Madrid	{}	t	[]	{}	2025-08-26 12:47:51.876+00	t	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
64d71462-3097-4abf-a718-140d9205257c	ES	IPD	Estación de Servicio Barcelona	Avinguda Diagonal 123	Barcelona	08013	Barcelona	ESP	{"latitude": 41.3851, "longitude": 2.1734}	[]	ALONG_MOTORWAY	[]	{}	{}	\N	{}	["RESTAURANT","SHOP","RESTROOM"]	Europe/Madrid	{}	t	[]	{}	2025-08-26 12:47:51.876+00	t	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
8ea3e1b5-d515-48e7-9763-332e8d81841f	PT	IPD	Centro Comercial Porto	Rua de Santa Catarina 123	Porto	4000-000	Porto	PRT	{"latitude": 41.1579, "longitude": -8.6291}	[]	PARKING_GARAGE	[]	{}	{}	\N	{}	["RESTAURANT","SHOPPING","PARKING"]	Europe/Lisbon	{}	t	[]	{}	2025-08-26 12:47:51.876+00	t	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
c212d574-c698-4e78-8175-121441bce3f6	PT	IPD	Estación de Servicio Lisboa	Avenida da República 45	Lisboa	1050-000	Lisboa	PRT	{"latitude": 38.7223, "longitude": -9.1393}	[]	ALONG_MOTORWAY	[]	{}	{}	\N	{}	["RESTAURANT","SHOP","RESTROOM"]	Europe/Lisbon	{}	t	[]	{}	2025-08-26 12:47:51.876+00	t	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00
\.


--
-- Data for Name: ocpi_tokens; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.ocpi_tokens (id, token, party_id, country_code, is_active, expires_at, created_at, last_used_at, metadata, created_at_sequelize, updated_at_sequelize) FROM stdin;
394dfd0d-ca83-44b2-9908-e10b3e556eb8	OCPI_WzvENWQIJq1SCvcjB9G4StMMhjtHKbypjqeUVgu5KurgkDUfFE3DLAoVeSG	DEMO	DE	t	\N	2025-08-26 19:31:00.879	2025-08-27 09:49:51.442	{"description":"Token generated for DEMO (DE)","generated_at":"2025-08-26T19:31:00.879Z","generated_by":"OCPI_CPO_SYSTEM","source":"credentials_exchange","requesting_roles":[{"role":"EMSP","party_id":"DEMO","country_code":"DE"}],"requesting_url":"https://another-platform.example.com/ocpi/versions/"}	\N	\N
9d22408c-a2b6-4747-b042-bd2742e1737f	OCPI_F6ca85uzAR2HvXLVXo8bF5cijizBSQohdYQkTTMYyrjD1jKrrXqk46qisKT	EXA	NL	t	\N	2025-08-26 19:27:48.777	2025-08-26 19:28:01.026	{"description":"Token generated for EXA (NL)","generated_at":"2025-08-26T19:27:48.777Z","generated_by":"OCPI_CPO_SYSTEM","source":"credentials_exchange","requesting_roles":[{"role":"EMSP","party_id":"EXA","country_code":"NL"}],"requesting_url":"https://tu-plataforma.example.com/ocpi/versions/"}	\N	\N
a126f53d-baaa-4412-853d-ce594684b1a6	OCPI_zChgOolkC4R8IuzlIYHq6EpWnDoSsAEGbRU6syQnZBG1olWizhIkqJTKR2N	TEST	ES	t	\N	2025-08-26 19:28:23.711	2025-08-26 19:30:37.725	{"description":"Token de prueba para TEST","generated_at":"2025-08-26T19:28:23.711Z","generated_by":"CLI_COMMAND","command_line":"/usr/local/bin/node /app/scripts/generate-ocpi-token.js generate --party-id TEST --country-code ES --description Token de prueba para TEST"}	\N	\N
532465e2-ec29-4e37-a744-1fa5fdecccd2	OCPI_Ni4T45t7N4LGkog8BHf3EnpU06YcnPTk6CIDbjpNdJvgKVdHhmKcR6B5atb	IPD	ES	t	\N	2025-08-28 07:34:25.529	2025-08-29 07:29:45.184	{"description":"Token generated manually for IPD","generated_at":"2025-08-28T07:34:25.529Z","generated_by":"CLI_COMMAND","command_line":"/usr/local/bin/node /app/scripts/generate-ocpi-token.js generate --party-id IPD --country-code ES"}	\N	\N
ad4c84f4-0c3a-470f-b3c6-6bb35c9a38f4	OCPI_mEDC1y8D2zqVrmwi6w49LAjOkjs9kf472TR12iIwMzd5tvcZiVYckby1HYH	ES*EPK	ES	t	\N	2025-08-27 06:09:01.885	2025-08-27 08:20:14.109	{"description":"Token inicial para ES*EPK","generated_at":"2025-08-27T06:09:01.885Z","generated_by":"CLI_COMMAND","command_line":"/usr/local/bin/node /app/scripts/generate-ocpi-token.js generate --party-id ES*EPK --country-code ES --description Token inicial para ES*EPK"}	\N	\N
0cbcb200-6c72-4e91-a5db-226b09caa637	OCPI_DMA1DZBCnhend495FanHpensyGRE5XDR6nd9sVYt5itSJKCveCjrDl85z4d	DEMO	NL	t	\N	2025-08-27 06:24:51.836	\N	{"description":"Token generated for DEMO (NL)","generated_at":"2025-08-27T06:24:51.836Z","generated_by":"OCPI_CPO_SYSTEM","source":"credentials_exchange","requesting_roles":[{"role":"EMSP","party_id":"DEMO","country_code":"NL"}],"requesting_url":"https://tu-plataforma.example.com/ocpi/versions/"}	\N	\N
cbb59eab-78e5-4495-befb-b80978396f69	OCPI_OuQXNxTm8pFXeNOCQ6EMzrl5ixNALdIkjwhYD3sX8sQxud6KpfhZJPMeo7C	ES*EFI	ES	t	\N	2025-08-27 06:08:15.757	2025-08-28 06:57:47.135	{"description":"Token inicial para ES*EFI","generated_at":"2025-08-27T06:08:15.757Z","generated_by":"CLI_COMMAND","command_line":"/usr/local/bin/node /app/scripts/generate-ocpi-token.js generate --party-id ES*EFI --country-code ES --description Token inicial para ES*EFI"}	\N	\N
2faaec39-0686-479b-a9f6-bb2871d91f3f	OCPI_AyMtsvXtrmOaAkhgn1pmKN74yCWhu53A8uDXYHJRQwdPIJKtRnZUxg7eeYA	EPK	ES	t	\N	2025-08-27 06:14:12.01	\N	{"description":"Token inicial para EPK","generated_at":"2025-08-27T06:14:12.010Z","generated_by":"CLI_COMMAND","command_line":"/usr/local/bin/node /app/scripts/generate-ocpi-token.js generate --party-id EPK --country-code ES --description Token inicial para EPK"}	\N	\N
4f75e33f-9d99-4b00-9aa8-b03258681669	OCPI_Ah22cUqvQW18IRs7eYU3lVjEF2XUgZCpqJxU6YEANSCcRFQhTn8OHnajuli	EFI	ES	f	\N	2025-08-27 06:10:27.325	\N	{"description":"Token generated for EFI (ES)","generated_at":"2025-08-27T06:10:27.325Z","generated_by":"OCPI_CPO_SYSTEM","source":"credentials_exchange","requesting_roles":[{"role":"EMSP","party_id":"EFI","country_code":"ES"}],"requesting_url":"https://efi-platform.example.com/ocpi/versions/"}	\N	\N
default-token-id	ocpi_token_es_cpo_2024_secure_key	ES-CPO	ES	t	\N	2025-08-26 17:25:34.202171	2025-08-28 08:39:20.967	{"description": "Default token for ES-CPO", "type": "default"}	\N	\N
a98c8aa1-1200-48e1-9aa5-fe1665c41f95	OCPI_VUC2CxEAhYBuqBs8QwV1uoaLNeyZtqq0fjxzfjRlpjy7QUR2UZKVexzbeVt	EFI	ES	t	\N	2025-08-27 06:15:10.613	2025-08-28 08:50:44.772	{"description":"Token inicial para EFI","generated_at":"2025-08-27T06:15:10.613Z","generated_by":"CLI_COMMAND","command_line":"/usr/local/bin/node /app/scripts/generate-ocpi-token.js generate --party-id EFI --country-code ES --description Token inicial para EFI"}	\N	\N
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.sessions (id, country_code, party_id, evse_uid, connector_id, id_token, start_datetime, end_datetime, total_cost, status, last_updated, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tariffs; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.tariffs (id, country_code, party_id, currency, type, elements, last_updated, created_at, updated_at, start_date_time, end_date_time) FROM stdin;
5c962802-1f96-41bb-bef0-4897cb37d250	ES	IPD	EUR	REGULAR	[{"price_components":[{"type":"ENERGY","price":0.25,"step_size":1}]}]	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	\N	\N
dc13581f-9779-4c29-aa0e-00c6865410f0	ES	IPD	EUR	PROFILE_FAST	[{"price_components":[{"type":"ENERGY","price":0.35,"step_size":1}]}]	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	\N	\N
\.


--
-- Data for Name: tokens; Type: TABLE DATA; Schema: public; Owner: cpo_user
--

COPY public.tokens (id, country_code, party_id, uid, type, auth_method, issuer, valid, whitelist, last_updated, created_at, updated_at, visual_number, group_id, language, default_profile_type, energy_contract, contract_id) FROM stdin;
d8f8cb26-8012-47b1-b516-11ca7ad3c749	ES	IPD	TOKEN-001	RFID	AUTH_REQUEST	\N	t	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	\N	\N	\N	\N	\N	\N
68060023-6963-4157-8425-2514f9b37348	ES	IPD	TOKEN-002	QR_CODE	AUTH_REQUEST	\N	t	\N	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	2025-08-26 12:47:51.876+00	\N	\N	\N	\N	\N	\N
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
-- Name: idx_emsp_sessions_emsp_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_sessions_emsp_party ON public.emsp_sessions USING btree (emsp_party_id, emsp_country_code);


--
-- Name: idx_emsp_sessions_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_emsp_sessions_last_updated ON public.emsp_sessions USING btree (last_updated);


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
-- Name: idx_evses_country_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_evses_country_party ON public.evses USING btree (country_code, party_id);


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
-- Name: idx_sessions_country_party; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_sessions_country_party ON public.sessions USING btree (country_code, party_id);


--
-- Name: idx_sessions_last_updated; Type: INDEX; Schema: public; Owner: cpo_user
--

CREATE INDEX idx_sessions_last_updated ON public.sessions USING btree (last_updated);


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

\unrestrict sb7ug4whW3wUMVPqbpeBsj9oMlcULVXdNfF9wvT1x7I56mpJFfa9szjPUIEH8iI

