import { API, FileInfo, Options, ASTNode } from "jscodeshift"
import { Collection } from "jscodeshift/src/Collection"

import { RuntimeOptions } from "../lib/types"
import runChecks from "../lib/runChecks"
import { skipTransformation } from "../lib/utils"

/**
 * Pure Class To Functional Component
 * =============================
 * Approach
 * ---------
 * - Check if the passed source is refactorable, i.e. looks for things we can't refactor
 * - If the the initial check passes, then check for where/what we can refactor
 * - Then run transformations based on the refactorable collections
 */
export default (file: FileInfo, api: API, options: Options) => {
  const j = api.jscodeshift
  const root: Collection<ASTNode> = j(file.source)

  const defaultOptions: RuntimeOptions = {
    refactorState: false
  }

  const runtimeOptions: RuntimeOptions = { ...defaultOptions, ...options }

  const isTransformable: Boolean = runChecks(root, runtimeOptions)

  if (!isTransformable) {
    skipTransformation(root, api, "Failed initial Check")
    return null
  }

  return root.toSource()
}