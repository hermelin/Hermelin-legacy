set(hermelin_gir_SRCS
  __init__.py
  agent.py
  config.py
  dbusservice.py
  notification.py
  hermelin.py
  i18n.py
  inspector.py
  utils.py
  view.py
  xhotkey.py
  )

python_install_module(${HERMELIN_PY_NAME} ${hermelin_gir_SRCS})
