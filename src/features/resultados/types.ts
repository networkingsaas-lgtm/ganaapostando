export interface Usuario {
  id: number;
  nombre: string;
  edad: number;
  genero: 'chica' | 'chico';
  tiempoLabels: string[];
  beneficioValues: number[];
  apuestasValues: number[];
  beneficioTotal: number;
  inversion: number;
  nCasasApuestas: number;
}



