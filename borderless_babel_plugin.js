export default function (babel) {
  const { types: t } = babel;

  const REGISTER = "__register";
  const BORDERLESS = "__borderless";
  const ENVIRONMENT = "__environment";

  return {
    name: "ast-transform",
    visitor: {
      Program(path) {
        path.unshiftContainer(
          "body",
          t.variableDeclaration("const", [
            t.variableDeclarator(
              t.identifier(REGISTER),
              t.callExpression(
                t.memberExpression(
                  t.identifier(BORDERLESS),
                  t.identifier("register")
                ),
                [t.identifier(ENVIRONMENT)]
              )
            ),
          ])
        );
        path.unshiftContainer(
          "body",
          t.importDeclaration(
            [t.ImportDefaultSpecifier(t.identifier(BORDERLESS))],
            t.stringLiteral("./borderless.js")
          )
        );
        path.unshiftContainer(
          "body",
          t.importDeclaration(
            [t.ImportDefaultSpecifier(t.identifier(ENVIRONMENT))],
            t.stringLiteral("./environment.js")
          )
        );
      },
      CallExpression(path) {
        if (
          t.isMemberExpression(path.node.callee) &&
          path.node.callee.object.name === BORDERLESS
        ) {
          return;
        }
        // don't await register functions
        if (path.node.callee.name === REGISTER) {
          return;
        }
        const awaitExp = t.awaitExpression(path.node);
        path.replaceWith(awaitExp);
        path.skip();
      },
      ArrowFunctionExpression(path) {
        path.node.async = true;

        // wrap arrow functions into register
        // with the name of the variable they are assigned to
        if (t.isVariableDeclarator(path.parent)) {
          const register = t.callExpression(t.identifier(REGISTER), [
            t.stringLiteral(path.parent.id.name),
            path.node,
          ]);
          path.replaceWith(register);
        }
      },
      FunctionDeclaration(path) {
        path.node.async = true;

        const funcExp = t.functionExpression(
          null,
          path.node.params,
          path.node.body,
          false, // generator
          true // async
        );

        const register = t.callExpression(t.identifier(REGISTER), [
          t.stringLiteral(path.node.id.name),
          funcExp,
        ]);

        const constant = t.variableDeclaration("const", [
          t.variableDeclarator(t.identifier(path.node.id.name), register),
        ]);

        path.replaceWith(constant);
      },
      FunctionExpression(path) {
        path.node.async = true;

        if (t.isVariableDeclarator(path.parent)) {
          const register = t.callExpression(t.identifier(REGISTER), [
            t.stringLiteral(path.parent.id.name),
            path.node,
          ]);
          path.replaceWith(register);
        }
      },
    },
  };
}
