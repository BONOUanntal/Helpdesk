import { IssueTypesService } from './issue-types.service';
export declare class IssueTypesController {
    private issueTypesService;
    constructor(issueTypesService: IssueTypesService);
    findAll(): Promise<{
        id: number;
        name: string;
        description: string | null;
    }[]>;
    create(body: {
        name: string;
        description?: string;
    }): Promise<{
        id: number;
        name: string;
        description: string | null;
    }>;
    remove(id: string): Promise<{
        id: number;
        name: string;
        description: string | null;
    }>;
}
