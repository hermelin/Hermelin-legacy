set(hermelin_SRCS
  __init__.py
  agent.py
  config.py
  gtknotification.py
  hermelin.py
  i18n.py
  utils.py
  view.py
  )

python_install_module(${HERMELIN_PY_NAME} ${hermelin_SRCS})
