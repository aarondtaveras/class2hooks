import {
  API,
  FileInfo,
  Options,
  ASTNode,
  variableDeclaration,
  identifier,
  variableDeclarator,
  arrowFunctionExpression,
  blockStatement,
  returnStatement,
  ImportDeclaration,
  importDeclaration,
  importDefaultSpecifier,
  literal
} from "jscodeshift"
import { Collection } from "jscodeshift/src/Collection"

import { RuntimeOptions } from "lib/types"
import runChecks from "lib/runChecks"
import {
  skipTransformation,
  findReactES6ClassDeclaration,
  isRenderMethod,
  getClassName,
  hasOnlyRenderMethod,
  findModule
} from "lib/utils"
import { NodePath } from "ast-types"

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
    skipTransformation(root, "Failed initial Check")
    return null
  }

  runTransformation(root)
  removeReactComponentImport(root)

  return root.toSource()
}

const runTransformation = (path: Collection<ASTNode>) =>
  findReactES6ClassDeclaration(path)
    .filter(p => hasOnlyRenderMethod(p))
    .replaceWith(p => {
      const name = getClassName(p)

      const renderMethod = p.value.body.body.filter(isRenderMethod)[0]
      // @ts-ignore
      const renderBody = renderMethod.value.body // TODO: figure out why we are getting type mismatch for renderBody
      const renderReturn = renderBody.body[0].argument

      // TODO: Add ability to make implicit returns on JSX
      return variableDeclaration("const", [
        variableDeclarator(
          identifier(name),
          arrowFunctionExpression(
            [],
            blockStatement([returnStatement(renderReturn)])
          )
        )
      ])
    })

const removeReactComponentImport = (path: Collection<ASTNode>) =>
  findModule(path, "react").replaceWith((p: NodePath<ImportDeclaration>) => {
    const imports = p.value.specifiers

    if (imports.length > 1) {
      return importDeclaration(
        [importDefaultSpecifier(identifier("React"))],
        literal("react")
      )
    }

    return null
  })
