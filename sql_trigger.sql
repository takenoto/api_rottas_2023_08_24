----------------------------------------------------------------------

-- Trigger SQL
-- Responsável por emitir um alerta cada vez que um veículo tiver sua
-- posição atualizada.

----------------------------------------------------------------------

-- // references:
-- // https://www.youtube.com/watch?v=0N6M5BBe9AE
-- // https://arctype.com/blog/postgres-notify-for-real-time-dashboards/
-- // https://tapoueh.org/blog/2018/07/postgresql-listen/notify/

----------------------------------------------------------------------

create or replace function tc_positions_modified_notify() returns trigger as $psql$
begin
  perform (
  	with payload(deviceid)
	  as (
	  	SELECT NEW.deviceid
	  )
	select pg_notify('tc_pos_event', row_to_json(payload)::text)
	  from payload
  );
  return null;
end;$psql$ language plpgsql;

CREATE OR REPLACE TRIGGER watch_tc_pos
AFTER INSERT OR UPDATE 
ON PUBLIC.tc_positions 
for each row execute procedure public.tc_positions_modified_notify();