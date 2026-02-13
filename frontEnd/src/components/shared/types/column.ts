export interface Column<T> {
    key: keyof T;
    label: string;
    render?: (value: T[keyof T], row: T, rowIndex: number) => React.ReactNode;
}