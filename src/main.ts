import {action} from './action'
import {Input} from './input'
import {Output} from './output'

export async function run(): Promise<void> {
  const output = new Output()
  try {
    const input = new Input()
    await action(input, output)
  } catch (error) {
    if (error instanceof Error) output.failed(error.message)
  }
}

run()
