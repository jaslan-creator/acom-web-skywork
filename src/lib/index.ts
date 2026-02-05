/**
 * Acom Trading - Constants and Type Definitions
 * This file centralizes routing and core data structures used across the application.
 */

export const ROUTE_PATHS = {
  HOME: "/",
  MARCAS: "/marcas",
  COMO_TRABAJAMOS: "/como-trabajamos",
  LINEA_CREDITO: "/linea-credito",
  SOBRE_ACOM: "/sobre-acom",
  CONTACTO: "/contacto",
} as const;

/**
 * Represents a wholesale brand distributed by Acom Trading
 */
export interface Brand {
  id: string;
  name: string;
  headline: string;
  description: string;
  cta: string;
  imageKey?: string;
}

/**
 * Represents a step in the wholesale purchasing process
 */
export interface ProcessStep {
  number: number;
  title: string;
  description: string;
}

/**
 * Represents a key value proposition or benefit of working with Acom
 */
export interface Benefit {
  title: string;
  description: string;
}

/**
 * Contact information and global business rules
 */
export const BUSINESS_CONFIG = {
  MIN_ORDER_USD: 250,
  WHATSAPP_PHONE: "584244567154",
  EMAIL: "ventas@acomve.com",
  ADDRESS: "Urb. Industrial Castillito, Calle 97, Centro Comercial Valencia (CCCV II). Local 18. Valencia. Venezuela",
  RESPONSE_TIME_EXPECTATION: "48 horas hábiles",
  COUNTRY: "Venezuela",
} as const;
