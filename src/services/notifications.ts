import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Interface para dados de notificação
 */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_reminder' | 'general';
  read: boolean;
  createdAt: string;
  appointmentId?: string;
}

const STORAGE_KEY = '@MedicalApp:notifications';

/**
 * Serviço de notificações
 * Gerencia criação, leitura e persistência de notificações do sistema
 */
export const notificationService = {
  /**
   * Busca todas as notificações de um usuário
   * Retorna ordenadas por data de criação (mais recentes primeiro)
   */
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];
      return allNotifications.filter(n => n.userId === userId).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      return [];
    }
  },

  /**
   * Cria uma nova notificação
   * Gera ID único e timestamp automaticamente
   */
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];
      
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        read: false,
      };

      allNotifications.push(newNotification);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allNotifications));
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
    }
  },

  /**
   * Marca uma notificação específica como lida
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];
      
      const updatedNotifications = allNotifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  },

  /**
   * Marca todas as notificações de um usuário como lidas
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];
      
      const updatedNotifications = allNotifications.map(n => 
        n.userId === userId ? { ...n, read: true } : n
      );

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
    }
  },

  /**
   * Remove uma notificação específica
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];
      
      const filteredNotifications = allNotifications.filter(n => n.id !== notificationId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredNotifications));
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  },

  /**
   * Conta notificações não lidas de um usuário
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getNotifications(userId);
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      return 0;
    }
  },

  /**
   * Notifica paciente sobre confirmação de consulta
   */
  async notifyAppointmentConfirmed(patientId: string, appointmentDetails: any): Promise<void> {
    await this.createNotification({
      userId: patientId,
      type: 'appointment_confirmed',
      title: 'Consulta Confirmada',
      message: `Sua consulta com ${appointmentDetails.doctorName} foi confirmada para ${appointmentDetails.date} às ${appointmentDetails.time}.`,
      appointmentId: appointmentDetails.id,
    });
  },

  /**
   * Notifica paciente sobre cancelamento de consulta
   */
  async notifyAppointmentCancelled(patientId: string, appointmentDetails: any, reason?: string): Promise<void> {
    await this.createNotification({
      userId: patientId,
      type: 'appointment_cancelled',
      title: 'Consulta Cancelada',
      message: `Sua consulta com ${appointmentDetails.doctorName} foi cancelada.${reason ? ` Motivo: ${reason}` : ''}`,
      appointmentId: appointmentDetails.id,
    });
  },

  /**
   * Notifica médico sobre nova consulta agendada
   */
  async notifyNewAppointment(doctorId: string, appointmentDetails: any): Promise<void> {
    await this.createNotification({
      userId: doctorId,
      type: 'general',
      title: 'Nova Consulta Agendada',
      message: `${appointmentDetails.patientName} agendou uma consulta para ${appointmentDetails.date} às ${appointmentDetails.time}.`,
      appointmentId: appointmentDetails.id,
    });
  },

  /**
   * Envia lembrete de consulta para usuário
   */
  async notifyAppointmentReminder(userId: string, appointmentDetails: any): Promise<void> {
    await this.createNotification({
      userId: userId,
      type: 'appointment_reminder',
      title: 'Lembrete de Consulta',
      message: `Você tem uma consulta agendada para amanhã às ${appointmentDetails.time} com ${appointmentDetails.doctorName || appointmentDetails.patientName}.`,
      appointmentId: appointmentDetails.id,
    });
  },
};
