--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

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
-- Name: change_balance(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.change_balance() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
	IF TG_OP = 'INSERT' THEN
  	UPDATE envelopes
    SET balance = balance - NEW.payment
    WHERE id = NEW.envelope_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.envelope_id <> NEW.envelope_id THEN
        UPDATE envelopes
        SET balance = balance - NEW.payment
        WHERE id = NEW.envelope_id;
        UPDATE envelopes
        SET balance = balance + OLD.payment
        WHERE id = OLD.envelope_id;
    ELSE
        UPDATE envelopes
        SET balance = balance - NEW.payment + OLD.payment
        WHERE id = NEW.envelope_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE envelopes
    SET balance = balance + OLD.payment
    WHERE id = OLD.envelope_id;
  END IF;
  RETURN NEW;
END
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: envelopes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.envelopes (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    balance real DEFAULT '0'::real NOT NULL
);


--
-- Name: envelopes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.envelopes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: envelopes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.envelopes_id_seq OWNED BY public.envelopes.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    date date,
    payment real DEFAULT '0'::real NOT NULL,
    recipient character varying(100),
    envelope_id integer DEFAULT 1 NOT NULL
);


--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: envelopes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.envelopes ALTER COLUMN id SET DEFAULT nextval('public.envelopes_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Data for Name: envelopes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.envelopes (id, title, balance) FROM stdin;
2	title2	500
1	title1	1000
4	title3	10
5	Credit Card	2000
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, date, payment, recipient, envelope_id) FROM stdin;
1	2024-02-18	10	Bank	4
\.


--
-- Name: envelopes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.envelopes_id_seq', 140, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.transactions_id_seq', 39, true);


--
-- Name: envelopes envelopes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.envelopes
    ADD CONSTRAINT envelopes_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: transactions update_balance_trg; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_balance_trg AFTER INSERT OR DELETE OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.change_balance();


--
-- Name: transactions transactions_envelope_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_envelope_id_fkey FOREIGN KEY (envelope_id) REFERENCES public.envelopes(id) ON DELETE SET DEFAULT;


--
-- PostgreSQL database dump complete
--

