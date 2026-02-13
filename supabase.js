import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://wfdffpeorvzlvyktpkao.supabase.co"
const supabaseKey = "sb_publishable_TfDaEMk0JIFIFDXAzQraPQ_-2I6kOcu"

export const supabase = createClient(supabaseUrl, supabaseKey)
