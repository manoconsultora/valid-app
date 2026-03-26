export type Ok<T = void> = { data: T; ok: true }
export type Err = { error: { code?: string; message: string }; ok: false }
export type Result<T = void> = Err | Ok<T>
