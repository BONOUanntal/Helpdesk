export declare class MailService {
    private transporter;
    sendNewTicketEmail(to: string, data: {
        ticketId: number;
        subject: string;
        clientEmail: string;
        clientName?: string;
        priority: string;
        appName: string;
    }): Promise<void>;
    sendNewMessageEmail(to: string, data: {
        ticketId: number;
        subject: string;
        clientName?: string;
        clientEmail: string;
        message: string;
        appName: string;
    }): Promise<void>;
}
